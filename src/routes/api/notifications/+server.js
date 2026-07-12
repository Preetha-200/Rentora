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
			.collection('notifications')
			.where('userId', '==', locals.user.id)
			.get();

		const notifications = snapshot.docs
			.map((doc) => ({
				id: doc.id,
				...doc.data()
			}))
			.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

		return json({
			total: notifications.length,
			unread: notifications.filter(
				(n) => !n.read && !n.isRead
			).length,
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

async function markAsRead(request, locals) {
	if (!locals.user) {
		return json(
			{ message: 'Authentication required' },
			{ status: 401 }
		);
	}

	const { notificationId } = await request.json();

	if (!notificationId) {
		return json(
			{ message: 'Notification ID is required.' },
			{ status: 400 }
		);
	}

	const notificationRef = db
		.collection('notifications')
		.doc(notificationId);

	const snapshot = await notificationRef.get();

	if (!snapshot.exists) {
		return json(
			{ message: 'Notification not found.' },
			{ status: 404 }
		);
	}

	const notification = snapshot.data();

	if (notification.userId !== locals.user.id) {
		return json(
			{ message: 'Not authorized.' },
			{ status: 403 }
		);
	}

	await notificationRef.update({
		read: true,
		isRead: true
	});

	return json({
		message: 'Notification marked as read.'
	});
}

export async function PUT({ request, locals }) {
	try {
		return await markAsRead(request, locals);
	} catch (error) {
		console.error(error);
		return json({ message: error.message }, { status: 500 });
	}
}

// PATCH is the semantically correct verb here since this only ever flips
// the `read`/`isRead` fields on one notification, never a full replace.
// PUT above is kept working as a backward-compatible alias.
export async function PATCH({ request, locals }) {
	try {
		return await markAsRead(request, locals);
	} catch (error) {
		console.error(error);
		return json({ message: error.message }, { status: 500 });
	}
}