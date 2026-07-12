import { error } from '@sveltejs/kit';
import { db } from '$lib/server/firebase';

export async function load({ params }) {
	const doc = await db.collection('properties').doc(params.id).get();

	if (!doc.exists) {
		throw error(404, 'Property not found');
	}

	return {
		property: { id: doc.id, ...doc.data() }
	};
}
