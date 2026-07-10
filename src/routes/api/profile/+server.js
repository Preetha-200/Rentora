import { json } from '@sveltejs/kit';
import { db } from '$lib/server/firebase';

// ======================
// Get Profile
// ======================
export async function GET({ locals }) {
	try {
		if (!locals.user) {
			return json(
				{ message: 'Authentication required' },
				{ status: 401 }
			);
		}

		const userDoc = await db
			.collection('users')
			.doc(locals.user.id)
			.get();

		if (!userDoc.exists) {
			return json(
				{ message: 'User not found' },
				{ status: 404 }
			);
		}

		return json({
			id: userDoc.id,
			...userDoc.data()
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

// ======================
// Update Profile
// ======================
export async function PUT({ request, locals }) {
	try {
		if (!locals.user) {
			return json(
				{ message: 'Authentication required' },
				{ status: 401 }
			);
		}

		const {
			name,
			email,
			gender,
			dateOfBirth
		} = await request.json();

		await db
			.collection('users')
			.doc(locals.user.id)
			.update({
				name,
				email,
				gender,
				dateOfBirth,
				updatedAt: new Date().toISOString()
			});

		return json({
			message: 'Profile updated successfully'
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