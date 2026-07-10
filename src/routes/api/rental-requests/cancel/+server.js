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

		const { requestId } = await request.json();

		if (!requestId) {
			return json(
				{ message: 'Request ID is required' },
				{ status: 400 }
			);
		}

		const requestRef = db.collection('rentalRequests').doc(requestId);
		const snapshot = await requestRef.get();

		if (!snapshot.exists) {
			return json(
				{ message: 'Rental request not found' },
				{ status: 404 }
			);
		}

		const rentalRequest = snapshot.data();

		// Only owner or tenant can cancel
		if (
			rentalRequest.ownerId !== locals.user.id &&
			rentalRequest.tenantId !== locals.user.id
		) {
			return json(
				{ message: 'Not authorized' },
				{ status: 403 }
			);
		}

		if (rentalRequest.status !== 'Pending') {
			return json(
				{
					message: 'Only pending requests can be cancelled'
				},
				{
					status: 400
				}
			);
		}

		await requestRef.update({
			status: 'Cancelled',
			cancelledBy: locals.user.id,
			cancelledAt: new Date().toISOString(),
			updatedAt: new Date().toISOString()
		});

		// Notification
		const notifyUser =
			rentalRequest.ownerId === locals.user.id
				? rentalRequest.tenantId
				: rentalRequest.ownerId;

		await db.collection('notifications').add({
			userId: notifyUser,
			title: 'Rental Request Cancelled',
			message: `Rental request for "${rentalRequest.propertyTitle}" has been cancelled.`,
			type: 'REQUEST_CANCELLED',
			isRead: false,
			createdAt: new Date().toISOString()
		});

		return json({
			message: 'Rental request cancelled successfully'
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