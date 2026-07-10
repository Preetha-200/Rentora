import { auth, db } from '$lib/server/firebase';

export async function handle({ event, resolve }) {
	const token = event.request.headers
		.get('authorization')
		?.replace('Bearer ', '');

	event.locals.user = null;

	if (token) {
		try {
			const decoded = await auth.verifyIdToken(token);

			const userDoc = await db.collection('users').doc(decoded.uid).get();

			if (userDoc.exists) {
				event.locals.user = {
					id: decoded.uid,
					...userDoc.data()
				};
			}
		} catch (error) {
			console.error(error);
		}
	}

	return resolve(event);
}