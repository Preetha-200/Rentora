import { json } from '@sveltejs/kit';
import { db, bucket } from '$lib/server/firebase';

export async function POST({ request, locals }) {
	try {
		if (!locals.user) {
			return json(
				{ message: 'Authentication required' },
				{ status: 401 }
			);
		}

		const data = await request.formData();
		const file = data.get('image');

		if (!file || !file.name) {
			return json(
				{ message: 'Profile image is required' },
				{ status: 400 }
			);
		}

		const bytes = Buffer.from(await file.arrayBuffer());

		const fileName = `profiles/${locals.user.id}_${Date.now()}_${file.name}`;

		const storageFile = bucket.file(fileName);

		await storageFile.save(bytes, {
			metadata: {
				contentType: file.type
			}
		});

		const [imageUrl] = await storageFile.getSignedUrl({
			action: 'read',
			expires: '01-01-2035'
		});

		await db
			.collection('users')
			.doc(locals.user.id)
			.update({
				profileImage: imageUrl,
				updatedAt: new Date().toISOString()
			});

		return json({
			message: 'Profile picture uploaded successfully',
			imageUrl
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