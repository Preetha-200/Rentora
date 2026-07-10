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

		// Uncomment this after admin role is implemented
		/*
		if (locals.user.role !== 'admin') {
			return json(
				{ message: 'Unauthorized' },
				{ status: 403 }
			);
		}
		*/

		// Users
		const usersSnapshot = await db.collection('users').get();
		const users = usersSnapshot.docs.map((doc) => doc.data());

		const totalUsers = users.length;

		const totalOwners = users.filter(
			(user) => user.role === 'owner'
		).length;

		const totalTenants = users.filter(
			(user) => user.role === 'tenant'
		).length;

		// Properties
		const propertiesSnapshot = await db.collection('properties').get();
		const properties = propertiesSnapshot.docs.map((doc) => doc.data());

		const totalProperties = properties.length;

		const pendingApprovals = properties.filter(
			(property) => property.status === 'Pending'
		).length;

		return json({
			totalUsers,
			totalOwners,
			totalTenants,
			totalProperties,
			pendingApprovals
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