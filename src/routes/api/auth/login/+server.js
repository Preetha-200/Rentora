import { json } from '@sveltejs/kit';
import { auth, db } from '$lib/server/firebase';

export async function POST({ request }) {
	try {
		const { email } = await request.json();

		const userRecord = await auth.getUserByEmail(email);

		const userDoc = await db.collection('users').doc(userRecord.uid).get();

		if (!userDoc.exists) {
			return json(
				{
					success: false,
					message: 'User not found'
				},
				{ status: 404 }
			);
		}

		const token = await auth.createCustomToken(userRecord.uid);

		return json({
			success: true,
			token,
			user: userDoc.data()
		});
	} catch (error) {
		return json(
			{
				success: false,
				message: error.message
			},
			{ status: 400 }
		);
	}
}