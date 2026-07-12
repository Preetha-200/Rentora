import { json } from '@sveltejs/kit';
import { db } from '$lib/server/firebase';

export async function GET({ url, locals }) {
	try {
		if (!locals.user) {
			return json({ message: 'Authentication required' }, { status: 401 });
		}

		const propertyId = url.searchParams.get('propertyId');

		if (!propertyId) {
			return json({ message: 'propertyId is required' }, { status: 400 });
		}

		const snapshot = await db
			.collection('rentalRequests')
			.where('propertyId', '==', propertyId)
			.where('tenantId', '==', locals.user.id)
			.limit(1)
			.get();

		if (snapshot.empty) {
			return json({ exists: false });
		}

		const doc = snapshot.docs[0];

		return json({ exists: true, id: doc.id, ...doc.data() });
	} catch (error) {
		console.error(error);
		return json({ message: error.message }, { status: 500 });
	}
}

export async function POST({ request, locals }) {
	try {
		if (!locals.user) {
			return json(
				{ message: 'Authentication required' },
				{ status: 401 }
			);
		}

		const { propertyId } = await request.json();

		if (!propertyId) {
			return json(
				{ message: 'Property ID is required' },
				{ status: 400 }
			);
		}

		const propertyDoc = await db
			.collection('properties')
			.doc(propertyId)
			.get();

		if (!propertyDoc.exists) {
			return json(
				{ message: 'Property not found' },
				{ status: 404 }
			);
		}

		const property = propertyDoc.data();

		// Prevent owner requesting own property
		if (property.ownerId === locals.user.id) {
			return json(
				{ message: 'You cannot request your own property' },
				{ status: 400 }
			);
		}

		// Check existing request
		const existing = await db
			.collection('rentalRequests')
			.where('propertyId', '==', propertyId)
			.where('tenantId', '==', locals.user.id)
			.get();

		if (!existing.empty) {
			return json(
				{ message: 'Rental request already exists' },
				{ status: 409 }
			);
		}

		const requestRef = db.collection('rentalRequests').doc();

		const rentalRequest = {
			propertyId,
			propertyTitle: property.title,
			ownerId: property.ownerId,
			tenantId: locals.user.id,

			status: 'Pending',

			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString()
		};

		await requestRef.set(rentalRequest);

		// Notification
		await db.collection('notifications').add({
			userId: property.ownerId,
			title: 'New Rental Request',
			message: `${locals.user.id} requested "${property.title}"`,
			type: 'RENTAL_REQUEST',
			isRead: false,
			createdAt: new Date().toISOString()
		});

		return json(
			{
				id: requestRef.id,
				...rentalRequest
			},
			{
				status: 201
			}
		);
	} catch (error) {
		console.error(error);

		return json(
			{
				message: error.message
			},
			{
				status: 500
			}
		);
	}
}

async function acceptRentalRequest(requestId, locals) {
    try {
        if (!locals.user) {
            return json({ message: 'Authentication required' }, { status: 401 });
        }
        const requestRef = db.collection('rentalRequests').doc(requestId);
        const requestSnap = await requestRef.get();
        if (!requestSnap.exists) {
            return json({ message: 'Request not found' }, { status: 404 });
        }
        const request = requestSnap.data();
        if (request.ownerId !== locals.user.id) {
            return json({ message: 'Not authorized' }, { status: 403 });
        }
        if (request.status !== 'Pending') {
            return json({ message: 'Request already processed' }, { status: 400 });
        }
        const propertyRef = db.collection('properties').doc(request.propertyId);
        const propertySnap = await propertyRef.get();
        const property = propertySnap.data();
        const batch = db.batch();
        batch.update(requestRef, {
            status: 'Approved',
            updatedAt: new Date().toISOString()
        });
        // Requirement 8: Update tenant count and vacancy count
        batch.update(propertyRef, {
            tenantCount: (property.tenantCount || 0) + 1,
            vacancyCount: Math.max((property.vacancyCount || 0) - 1, 0),
            status: property.vacancyCount <= 1 ? 'Rented' : 'Available',
            updatedAt: new Date().toISOString()
        });
        // Create lease
        const leaseRef = db.collection('leases').doc();
        batch.set(leaseRef, {
            propertyId: request.propertyId,
            propertyTitle: property.title,
            tenantId: request.tenantId,
            ownerId: locals.user.id,
            status: 'Active',
            startDate: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });
        // Notify tenant
        batch.set(db.collection('notifications').doc(), {
            userId: request.tenantId,
            title: 'Rental Request Approved',
            message: `Your request for "${property.title}" has been approved by the owner.`,
            type: 'RENTAL_APPROVED',
            read: false,
            createdAt: new Date().toISOString()
        });
        await batch.commit();
        return json({ message: 'Request approved successfully' });
    } catch (error) {
        console.error(error);
        return json({ message: error.message }, { status: 500 });
    }
}

export async function PUT({ request, locals }) {
    try {
        if (!locals.user) {
            return json({ message: 'Authentication required' }, { status: 401 });
        }
        const { requestId, action } = await request.json();
        if (!requestId || !action) {
            return json({ message: 'Request ID and action are required' }, { status: 400 });
        }
        if (action === 'approve') {
            return acceptRentalRequest(requestId, locals);
        } else if (action === 'reject') {
            const requestRef = db.collection('rentalRequests').doc(requestId);
            const requestSnap = await requestRef.get();
            if (!requestSnap.exists) {
                return json({ message: 'Request not found' }, { status: 404 });
            }
            const request = requestSnap.data();
            if (request.ownerId !== locals.user.id) {
                return json({ message: 'Not authorized' }, { status: 403 });
            }
            await requestRef.update({
                status: 'Rejected',
                updatedAt: new Date().toISOString()
            });
            return json({ message: 'Request rejected' });
        } else {
            return json({ message: 'Invalid action' }, { status: 400 });
        }
    } catch (error) {
        console.error(error);
        return json({ message: error.message }, { status: 500 });
    }
}