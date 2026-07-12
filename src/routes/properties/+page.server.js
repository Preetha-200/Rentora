import { db } from '$lib/server/firebase';

export async function load() {
	try {
		const snapshot = await db
			.collection('properties')
			.where('approvalStatus', '==', 'Approved')
			.get();

		const properties = snapshot.docs.map((doc) => ({
			id: doc.id,
			...doc.data()
		}));

		return { properties };
	} catch (error) {
		console.error(error);
		return { properties: [], loadError: 'Failed to load properties.' };
	}
}
