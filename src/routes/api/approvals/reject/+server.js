import { json } from '@sveltejs/kit';
import { db } from '$lib/server/firebase';

export async function POST({ request, locals }) {
	try {
		// Uncomment after implementing admin roles
		/*
		if (!locals.user || locals.user.role !== 'admin') {
			return json(
				{ message: 'Unauthorized' },
				{ status: 403 }
			);
		}
		*/

		const { propertyId, reason } = await request.json();

		if (!propertyId || !reason) {
			return json(
				{
					message: 'Property ID and rejection reason are required'
				},
				{
					status: 400
				}
			);
		}

		const propertyRef = db.collection('properties').doc(propertyId);
		const snapshot = await propertyRef.get();

		if (!snapshot.exists) {
			return json(
				{ message: 'Property not found' },
				{ status: 404 }
			);
		}

		const property = snapshot.data();

		await propertyRef.update({
			status: 'Rejected',
			approvalReason: reason,
			rejectedBy: locals.user?.id || 'admin',
			rejectedAt: new Date().toISOString(),
			updatedAt: new Date().toISOString()
		});

		// Create notification for owner
		await db.collection('notifications').add({
			userId: property.ownerId,
			title: 'Property Rejected',
			message: `"${property.title}" was rejected. Reason: ${reason}`,
			type: 'PROPERTY_REJECTED',
			isRead: false,
			createdAt: new Date().toISOString()
		});

		return json({
			message: 'Property rejected successfully'
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