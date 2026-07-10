import { json } from '@sveltejs/kit';
import { db } from '$lib/server/firebase';

export async function GET({ locals }) {
	try {
		if (!locals.user) {
			return json(
				{ message: 'Authentication required' },
				{ status: 401 }
			);
		}

		const snapshot = await db.collection('leases').get();

		const leases = snapshot.docs
			.map((doc) => ({
				id: doc.id,
				...doc.data()
			}))
			.filter(
				(lease) =>
					lease.ownerId === locals.user.id ||
					lease.tenantId === locals.user.id
			);

		return json({
			total: leases.length,
			leases
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