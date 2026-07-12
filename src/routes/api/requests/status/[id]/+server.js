import { json } from '@sveltejs/kit';
import { db } from '$lib/server/firebase';

export async function PUT({ params, request, locals }) {
	try {
		if (!locals.user) {
			return json(
				{ message: 'Authentication required' },
				{ status: 401 }
			);
		}

		const { status } = await request.json();

		if (!['Accepted', 'Rejected'].includes(status)) {
			return json(
				{ message: 'Invalid request status.' },
				{ status: 400 }
			);
		}

		const requestRef = db.collection('requests').doc(params.id);
		const requestSnap = await requestRef.get();

		if (!requestSnap.exists) {
			return json(
				{ message: 'Request not found.' },
				{ status: 404 }
			);
		}

		const requestData = requestSnap.data();

		const propertyRef = db
			.collection('properties')
			.doc(requestData.propertyId);

		const propertySnap = await propertyRef.get();

		if (!propertySnap.exists) {
			return json(
				{ message: 'Property not found.' },
				{ status: 404 }
			);
		}

		const property = propertySnap.data();

		if (property.ownerId !== locals.user.id) {
			return json(
				{ message: 'Unauthorized.' },
				{ status: 403 }
			);
		}

		const batch = db.batch();

		batch.update(requestRef, {
			status,
			updatedAt: new Date().toISOString()
		});

		if (status === 'Accepted') {
			const tenantCount =
				(property.tenantCount || 0) + 1;

			const vacancyCount = Math.max(
				(property.vacancyCount || 0) - 1,
				0
			);

			batch.update(propertyRef, {
				tenantCount,
				vacancyCount,
				occupancyStatus:
					vacancyCount === 0
						? 'Fully Occupied'
						: 'Available',
				updatedAt: new Date().toISOString()
			});
		}
        		const notificationRef =
			db.collection('notifications').doc();

		batch.set(notificationRef, {
			userId: requestData.tenantId,
			title: 'Rental Request Update',
			message:
				status === 'Accepted'
					? `Your request for "${property.title}" has been accepted.`
					: `Your request for "${property.title}" has been rejected.`,
			type: 'REQUEST',
			propertyId: requestData.propertyId,
			read: false,
			createdAt: new Date().toISOString()
		});

		await batch.commit();

		return json({
			message:
				status === 'Accepted'
					? 'Tenant approved successfully.'
					: 'Tenant request rejected successfully.'
		});
	} catch (error) {
		console.error(error);

		return json(
			{
				message: error.message || 'Server error'
			},
			{
				status: 500
			}
		);
	}
}