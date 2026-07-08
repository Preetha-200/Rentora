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

		const { requestId, reason } = await request.json();

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

		// Only owner can reject
		if (rentalRequest.ownerId !== locals.user.id) {
			return json(
				{ message: 'Not authorized' },
				{ status: 403 }
			);
		}

		if (rentalRequest.status !== 'Pending') {
			return json(
				{ message: 'Request has already been processed' },
				{ status: 400 }
			);
		}

		await requestRef.update({
			status: 'Rejected',
			rejectionReason: reason || '',
			rejectedAt: new Date().toISOString(),
			updatedAt: new Date().toISOString()
		});

		// Notify tenant
		await db.collection('notifications').add({
			userId: rentalRequest.tenantId,
			title: 'Rental Request Rejected',
			message: `Your request for "${rentalRequest.propertyTitle}" has been rejected.`,
			type: 'REQUEST_REJECTED',
			isRead: false,
			createdAt: new Date().toISOString()
		});

		return json({
			message: 'Rental request rejected successfully'
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