import { auth, db } from '$lib/server/firebase';

export async function handle({ event, resolve }) {
	event.locals.user = null;

	const token = event.cookies.get('token');

	if (token) {
		try {
			const decoded = await auth.verifyIdToken(token);

			const userDoc = await db
				.collection('users')
				.doc(decoded.uid)
				.get();

			if (userDoc.exists) {
				event.locals.user = {
					id: decoded.uid,
					...userDoc.data()
				};
			}
		} catch (error) {
			console.error('Firebase auth verification failed:', error);
		}
	}

	return resolve(event);
}