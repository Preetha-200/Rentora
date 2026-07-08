import { json } from '@sveltejs/kit';
import { db } from '$lib/server/firebase';

export async function PUT({ request, locals }) {
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

		const { phone } = await request.json();

		if (!phone) {
			return json(
				{
					message: 'Phone number is required'
				},
				{
					status: 400
				}
			);
		}

		await db
			.collection('users')
			.doc(locals.user.id)
			.update({
				phone,
				updatedAt: new Date().toISOString()
			});

		return json({
			message: 'Phone number updated successfully'
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