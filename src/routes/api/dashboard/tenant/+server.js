import { json } from '@sveltejs/kit';
import { db } from '$lib/server/firebase';

export async function GET({ locals }) {
	try {
		if (!locals.user) {
			return json(
				{
					message: 'Authentication required'
				},
				{
					status: 401
				}
			);
		}

		const tenantId = locals.user.id;

		// Rental Requests
		const requestSnapshot = await db
			.collection('rentalRequests')
			.where('tenantId', '==', tenantId)
			.get();

		const totalRequests = requestSnapshot.size;

		const pendingRequests = requestSnapshot.docs.filter(
			(doc) => doc.data().status === 'Pending'
		).length;

		// Active Lease
		const leaseSnapshot = await db
			.collection('leases')
			.where('tenantId', '==', tenantId)
			.where('status', '==', 'Active')
			.get();

		const activeLease = leaseSnapshot.size;

		// Notifications
		const notificationSnapshot = await db
			.collection('notifications')
			.where('userId', '==', tenantId)
			.get();

		const recentNotifications = notificationSnapshot.size;

		return json({
			totalRequests,
			pendingRequests,
			activeLease,
			recentNotifications
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