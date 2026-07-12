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

		const { propertyId, amount, dueDate } =
			await request.json();

		if (!propertyId || !amount || !dueDate) {
			return json(
				{
					message:
						'Property, amount and due date are required.'
				},
				{ status: 400 }
			);
		}

		const propertyRef = db
			.collection('properties')
			.doc(propertyId);

		const propertySnap = await propertyRef.get();

		if (!propertySnap.exists) {
			return json(
				{ message: 'Property not found' },
				{ status: 404 }
			);
		}

		const property = propertySnap.data();

		if (property.ownerId !== locals.user.id) {
			return json(
				{ message: 'Not authorized' },
				{ status: 403 }
			);
		}

		if (!property.tenantId) {
			return json(
				{
					message:
						'No tenant is assigned to this property.'
				},
				{ status: 400 }
			);
		}

		const existing = await db
			.collection('payments')
			.where('propertyId', '==', propertyId)
			.where('dueDate', '==', dueDate)
			.get();

		if (!existing.empty) {
			return json(
				{
					message:
						'Payment invoice already exists for this due date.'
				},
				{ status: 400 }
			);
		}
        		const now = new Date().toISOString();

		const paymentRef = db.collection('payments').doc();
		const notificationRef = db.collection('notifications').doc();

		const batch = db.batch();

		batch.set(paymentRef, {
			propertyId,
			propertyTitle: property.title,
			ownerId: property.ownerId,
			tenantId: property.tenantId,
			amount: Number(amount),
			dueDate,
			status: 'Pending',
			createdAt: now,
			updatedAt: now
		});

		batch.set(notificationRef, {
			userId: property.tenantId,
			title: 'New Rent Invoice',
			message: `A rent invoice has been generated for "${property.title}".`,
			type: 'PAYMENT',
			propertyId,
			read: false,
			createdAt: now
		});

		await batch.commit();

		return json({
			message: 'Rent invoice generated successfully.'
		});
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