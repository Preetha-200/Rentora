import { json } from '@sveltejs/kit';
import { db } from '$lib/server/firebase';

// Helper: resolve user from cookie (locals) or Authorization header
async function resolveUser(event) {
	// Cookie-based (preferred)
	if (event.locals.user) return event.locals.user;

	// Header-based fallback (for profile fetch right after login)
	const authHeader = event.request.headers.get('authorization');
	if (authHeader) {
		const { auth } = await import('$lib/server/firebase');
		const token = authHeader.replace('Bearer ', '');
		const decoded = await auth.verifyIdToken(token);
		const snap = await db.collection('users').doc(decoded.uid).get();
		if (snap.exists) return { id: decoded.uid, ...snap.data() };
	}
	return null;
}

export async function GET(event) {
	try {
		const user = await resolveUser(event);
		if (!user) return json({ message: 'Authentication required' }, { status: 401 });

		const userDoc = await db.collection('users').doc(user.id).get();
		if (!userDoc.exists) return json({ message: 'User not found' }, { status: 404 });

		return json({ success: true, user: { id: user.id, ...userDoc.data() } });
	} catch (error) {
		return json({ message: error.message }, { status: 401 });
	}
}

export async function PUT(event) {
	try {
		const user = await resolveUser(event);
		if (!user) return json({ message: 'Authentication required' }, { status: 401 });

		const body = await event.request.json();
		const allowed = ['name', 'phone', 'bio'];
		const updates = {};
		for (const key of allowed) {
			if (body[key] !== undefined) updates[key] = body[key];
		}
		updates.updatedAt = new Date().toISOString();

		await db.collection('users').doc(user.id).update(updates);
		return json({ success: true, message: 'Profile updated' });
	} catch (error) {
		return json({ message: error.message }, { status: 500 });
	}
}