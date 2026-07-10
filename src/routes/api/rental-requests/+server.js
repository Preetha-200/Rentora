import { json } from '@sveltejs/kit';
import { db } from '$lib/server/firebase';

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