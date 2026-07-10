import { json } from '@sveltejs/kit';
import { db } from '$lib/server/firebase';

export async function GET({ locals }) {
	try {
		// Optional: Uncomment after your auth system has admin roles
		/*
		if (!locals.user || locals.user.role !== 'admin') {
			return json(
				{ message: 'Unauthorized' },
				{ status: 403 }
			);
		}
		*/

		const snapshot = await db
			.collection('properties')
			.where('status', '==', 'Pending')
			.get();

		const properties = snapshot.docs.map((doc) => ({
			id: doc.id,
			...doc.data()
		}));

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