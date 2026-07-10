import { json } from '@sveltejs/kit';
import { db } from '$lib/server/firebase';

export async function POST({ request, locals }) {
	try {
		// Enable this after implementing admin roles
		/*
		if (!locals.user || locals.user.role !== 'admin') {
			return json(
				{ message: 'Unauthorized' },
				{ status: 403 }
			);
		}
		*/

		const { propertyId } = await request.json();

		if (!propertyId) {
			return json(
				{ message: 'Property ID is required' },
				{ status: 400 }
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

		if (property.status === 'Approved') {
			return json({
				message: 'Property is already approved'
			});
		}

		await propertyRef.update({
			status: 'Approved',
			approvalReason: '',
			approvedBy: locals.user?.id || 'admin',
			approvedAt: new Date().toISOString(),
			updatedAt: new Date().toISOString()
		});

		// Create notification
		await db.collection('notifications').add({
			userId: property.ownerId,
			title: 'Property Approved',
			message: `"${property.title}" has been approved.`,
			type: 'PROPERTY_APPROVED',
			isRead: false,
			createdAt: new Date().toISOString()
		});

		return json({
			message: 'Property approved successfully'
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