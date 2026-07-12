import { json } from '@sveltejs/kit';
import { db } from '$lib/server/firebase';

export async function GET({ locals }) {
	try {
		if (!locals.user || locals.user.role !== 'admin') {
			return json({ message: 'Unauthorized' }, { status: 403 });
		}

		const snapshot = await db.collection('users').get();

		const users = snapshot.docs.map((doc) => ({
			id: doc.id,
			...doc.data()
		}));

		return json(users);
	} catch (error) {
		console.error(error);
		return json({ message: error.message }, { status: 500 });
	}
}

// PATCH instead of PUT: this only ever changes one field (`disabled`),
// never the full user record, so a partial-update verb is the correct fit.
export async function PATCH({ request, locals }) {
	try {
		if (!locals.user || locals.user.role !== 'admin') {
			return json({ message: 'Unauthorized' }, { status: 403 });
		}

		const { userId, action } = await request.json();

		if (!userId || !['enable', 'disable'].includes(action)) {
			return json({ message: 'userId and a valid action are required' }, { status: 400 });
		}

		await db.collection('users').doc(userId).update({
			disabled: action === 'disable',
			updatedAt: new Date().toISOString()
		});

		return json({ message: `User ${action}d successfully.` });
	} catch (error) {
		console.error(error);
		return json({ message: error.message }, { status: 500 });
	}
}
