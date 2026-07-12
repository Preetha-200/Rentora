import { json } from '@sveltejs/kit';
import { auth } from '$lib/server/firebase';

export async function POST({ request, cookies }) {
	try {
		const { token } = await request.json();
		if (!token) return json({ message: 'Token required' }, { status: 400 });
		// Verify token is valid before setting cookie
		await auth.verifyIdToken(token);
		cookies.set('token', token, {
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			secure: false, // set to true in production with HTTPS
			maxAge: 60 * 60 * 24 * 7 // 7 days — client refreshes every 55 min
		});
		return json({ success: true });
	} catch (err) {
		return json({ message: err.message }, { status: 401 });
	}
}

export async function DELETE({ cookies }) {
	cookies.delete('token', { path: '/' });
	return json({ success: true });
}
