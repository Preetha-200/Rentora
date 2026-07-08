import { json } from '@sveltejs/kit';
import { db } from '$lib/server/firebase';

export async function GET({ url, locals }) {
	try {
		const status = url.searchParams.get('status');
		const mine = url.searchParams.get('mine');

		let snapshot = await db.collection('properties').get();

		let properties = snapshot.docs.map((doc) => ({
			id: doc.id,
			...doc.data()
		}));

		// Owner's properties only
		if (mine === 'true' && locals.user) {
			properties = properties.filter(
				(property) => property.ownerId === locals.user.id
			);
		}

		// Filter by status
		if (status) {
			properties = properties.filter(
				(property) =>
					property.status?.toLowerCase() ===
					status.toLowerCase()
			);
		}

		return json({
			total: properties.length,
			properties
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