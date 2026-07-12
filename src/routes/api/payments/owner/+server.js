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
			.collection('payments')
			.where('ownerId', '==', locals.user.id)
			.get();

		const payments = snapshot.docs
			.map((doc) => ({
				id: doc.id,
				...doc.data()
			}))
			.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

		return json(payments);
	} catch (error) {
		console.error(error);
		return json(
			{ message: error.message },
			{ status: 500 }
		);
	}
}