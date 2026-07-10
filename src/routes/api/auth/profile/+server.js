import { json } from '@sveltejs/kit';
import { auth, db } from '$lib/server/firebase';

export async function GET({ request }) {
	try {
		const authorization = request.headers.get('authorization');

		if (!authorization) {
			return json(
				{
					success: false,
					message: 'Authorization token missing'
				},
				{ status: 401 }
			);
		}

		const token = authorization.replace('Bearer ', '');

		const decoded = await auth.verifyIdToken(token);

		const userDoc = await db.collection('users').doc(decoded.uid).get();

		if (!userDoc.exists) {
			return json(
				{
					success: false,
					message: 'User not found'
				},
				{ status: 404 }
			);
		}

		return json({
			success: true,
			user: userDoc.data()
		});
	} catch (error) {
		return json(
			{
				success: false,
				message: error.message
			},
			{ status: 401 }
		);
	}
}