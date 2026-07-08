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

		const ownerId = locals.user.id;

		// Properties
		const propertySnapshot = await db
			.collection('properties')
			.where('ownerId', '==', ownerId)
			.get();

		const properties = propertySnapshot.docs.map((doc) => doc.data());

		const totalProperties = properties.length;

		const pendingProperties = properties.filter(
			(p) => p.status === 'Pending'
		).length;

		const approvedProperties = properties.filter(
			(p) => p.status === 'Approved'
		).length;

		// Rental Requests
		const requestSnapshot = await db
			.collection('rentalRequests')
			.where('ownerId', '==', ownerId)
			.get();

		const rentalRequests = requestSnapshot.size;

		// Active Tenants
		const leaseSnapshot = await db
			.collection('leases')
			.where('ownerId', '==', ownerId)
			.where('status', '==', 'Active')
			.get();

		const activeTenants = leaseSnapshot.size;

		return json({
			totalProperties,
			pendingProperties,
			approvedProperties,
			rentalRequests,
			activeTenants
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