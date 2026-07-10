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

		const snapshot = await db
			.collection('rentalRequests')
			.where('ownerId', '==', locals.user.id)
			.orderBy('createdAt', 'desc')
			.get();

		const requests = snapshot.docs.map((doc) => ({
			id: doc.id,
			...doc.data()
		}));

		return json({
			total: requests.length,
			requests
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