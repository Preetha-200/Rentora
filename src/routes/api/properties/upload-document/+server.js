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

		const formData = await request.formData();

		const propertyId = formData.get('propertyId');
		const files = formData.getAll('documents');

		if (!propertyId) {
			return json(
				{ message: 'Property ID is required' },
				{ status: 400 }
			);
		}

		const docRef = db.collection('properties').doc(propertyId);
		const snapshot = await docRef.get();

		if (!snapshot.exists) {
			return json(
				{ message: 'Property not found' },
				{ status: 404 }
			);
		}

		const property = snapshot.data();

		if (property.ownerId !== locals.user.id) {
			return json(
				{ message: 'Not authorized' },
				{ status: 403 }
			);
		}

		const documentUrls = property.documents || [];

		for (const file of files) {
			if (!file.name) continue;

			const bytes = Buffer.from(await file.arrayBuffer());

			const fileName = `${propertyId}_${Date.now()}_${file.name}`;

			const storageFile = bucket.file(`property-documents/${fileName}`);

			await storageFile.save(bytes, {
				metadata: {
					contentType: file.type
				}
			});

			const [url] = await storageFile.getSignedUrl({
				action: 'read',
				expires: '01-01-2035'
			});

			documentUrls.push({
				name: file.name,
				url
			});
		}

		await docRef.update({
			documents: documentUrls,
			updatedAt: new Date().toISOString()
		});

		return json({
			message: 'Documents uploaded successfully',
			documents: documentUrls
		});
	} catch (error) {
		console.error(error);

		return json(
			{ message: error.message },
			{ status: 500 }
		);
	}
}