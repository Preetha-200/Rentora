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

		const { leaseId } = await request.json();

		if (!leaseId) {
			return json(
				{ message: 'Lease ID is required' },
				{ status: 400 }
			);
		}

		const leaseRef = db.collection('leases').doc(leaseId);
		const snapshot = await leaseRef.get();

		if (!snapshot.exists) {
			return json(
				{ message: 'Lease not found' },
				{ status: 404 }
			);
		}

		const lease = snapshot.data();

		// Only tenant can accept
		if (lease.tenantId !== locals.user.id) {
			return json(
				{ message: 'Not authorized' },
				{ status: 403 }
			);
		}

		if (lease.status !== 'Pending Acceptance') {
			return json(
				{ message: 'Lease has already been processed' },
				{ status: 400 }
			);
		}

		await leaseRef.update({
			status: 'Active',
			acceptedAt: new Date().toISOString(),
			updatedAt: new Date().toISOString()
		});

		// Notify owner
		await db.collection('notifications').add({
			userId: lease.ownerId,
			title: 'Lease Accepted',
			message: `Tenant accepted the lease for "${lease.propertyTitle}".`,
			type: 'LEASE_ACCEPTED',
			isRead: false,
			createdAt: new Date().toISOString()
		});

		return json({
			message: 'Lease accepted successfully'
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