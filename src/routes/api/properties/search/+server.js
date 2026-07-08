import { json } from '@sveltejs/kit';
import { db } from '$lib/server/firebase';

export async function GET({ url }) {
	try {
		const keyword = (url.searchParams.get('keyword') || '').trim().toLowerCase();

		if (!keyword) {
			return json(
				{
					message: 'Search keyword is required'
				},
				{ status: 400 }
			);
		}

		const snapshot = await db.collection('properties').get();

		const properties = snapshot.docs
			.map((doc) => ({
				id: doc.id,
				...doc.data()
			}))
			.filter((property) => {
				return (
					property.title?.toLowerCase().includes(keyword) ||
					property.city?.toLowerCase().includes(keyword) ||
					property.address?.toLowerCase().includes(keyword) ||
					property.description?.toLowerCase().includes(keyword)
				);
			});

		return json({
			count: properties.length,
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