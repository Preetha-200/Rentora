import { json } from '@sveltejs/kit';
import { db } from '$lib/server/firebase';

export async function GET({ locals }) {
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

		const snapshot = await db
			.collection('notifications')
			.where('userId', '==', locals.user.id)
			.orderBy('createdAt', 'desc')
			.get();

		const notifications = snapshot.docs.map((doc) => ({
			id: doc.id,
			...doc.data()
		}));

		return json({
			total: notifications.length,
			unread: notifications.filter((n) => !n.isRead).length,
			notifications
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