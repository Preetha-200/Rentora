import { json } from '@sveltejs/kit';
import { db } from '$lib/server/firebase';

export async function GET({ url }) {
	try {
		let properties = [];

		const city = url.searchParams.get('city');
		const minRent = Number(url.searchParams.get('minRent')) || 0;
		const maxRent = Number(url.searchParams.get('maxRent')) || Number.MAX_SAFE_INTEGER;
		const bedrooms = Number(url.searchParams.get('bedrooms'));
		const furnishing = url.searchParams.get('furnishing');

		const snapshot = await db.collection('properties').get();

		properties = snapshot.docs.map((doc) => ({
			id: doc.id,
			...doc.data()
		}));

		if (city) {
			properties = properties.filter(
				(p) => p.city?.toLowerCase() === city.toLowerCase()
			);
		}

		properties = properties.filter(
			(p) => p.rent >= minRent && p.rent <= maxRent
		);

		if (bedrooms) {
			properties = properties.filter(
				(p) => p.bedrooms === bedrooms
			);
		}

		if (furnishing) {
			properties = properties.filter(
				(p) =>
					p.furnishing?.toLowerCase() ===
					furnishing.toLowerCase()
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