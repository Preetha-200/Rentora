import { json } from '@sveltejs/kit';
import { auth, db } from '$lib/server/firebase';

export async function POST({ request }) {
	try {
		const { name, email, phone, role, token } = await request.json();

		const decoded = await auth.verifyIdToken(token);

		const user = {
			uid: decoded.uid,
			name,
			email,
			phone,
			role: role || 'tenant',
			createdAt: new Date()
		};

		await db.collection('users').doc(decoded.uid).set(user);

		return json(
			{
				success: true,
				message: 'User Registered Successfully',
				user
			},
			{
				status: 201
			}
		);
	} catch (error) {
		return json(
			{
				success: false,
				message: error.message
			},
			{
				status: 500
			}
		);
	}
}