import { json } from '@sveltejs/kit';
import { db } from '$lib/server/firebase';

export async function DELETE({ request, locals }) {
	try {
		if (!locals.user) {
			return json(
				{ message: 'Authentication required' },
				{ status: 401 }
			);
		}

		const { notificationId } = await request.json();

		if (!notificationId) {
			return json(
				{ message: 'Notification ID is required' },
				{ status: 400 }
			);
		}

		const notificationRef = db
			.collection('notifications')
			.doc(notificationId);

		const snapshot = await notificationRef.get();

		if (!snapshot.exists) {
			return json(
				{ message: 'Notification not found' },
				{ status: 404 }
			);
		}

		const notification = snapshot.data();

		// Only owner of notification can delete
		if (notification.userId !== locals.user.id) {
			return json(
				{ message: 'Not authorized' },
				{ status: 403 }
			);
		}

		await notificationRef.delete();

		return json({
			message: 'Notification deleted successfully'
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