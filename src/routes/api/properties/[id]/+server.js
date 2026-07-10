import { json } from '@sveltejs/kit';
import { db, bucket } from '$lib/server/firebase';

export async function GET({ params }) {
	try {
		const doc = await db.collection('properties').doc(params.id).get();

		if (!doc.exists) {
			return json(
				{ message: 'Property not found' },
				{ status: 404 }
			);
		}

		return json({
			id: doc.id,
			...doc.data()
		});
	} catch (error) {
		console.error(error);

		return json(
			{ message: 'Server error' },
			{ status: 500 }
		);
	}
}

export async function PUT({ params, request, locals }) {
	try {
		if (!locals.user) {
			return json(
				{ message: 'Authentication required' },
				{ status: 401 }
			);
		}

		const docRef = db.collection('properties').doc(params.id);
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

		const data = await request.formData();

		const updateData = {
			title: data.get('title'),
			description: data.get('description'),
			address: data.get('address'),
			city: data.get('city'),
			rent: Number(data.get('rent')),
			bedrooms: Number(data.get('bedrooms')),
			bathrooms: Number(data.get('bathrooms')),
			furnishing: data.get('furnishing'),
			amenities:
				data.get('amenities')?.split(',').map((a) => a.trim()) || [],
			updatedAt: new Date().toISOString()
		};

		const files = data.getAll('images');

		if (files.length > 0 && files[0].name) {
			const imageUrls = property.images || [];

			for (const file of files) {
				const bytes = Buffer.from(await file.arrayBuffer());

				const fileName = `${params.id}_${Date.now()}_${file.name}`;

				const storageFile = bucket.file(`properties/${fileName}`);

				await storageFile.save(bytes, {
					metadata: {
						contentType: file.type
					}
				});

				const [url] = await storageFile.getSignedUrl({
					action: 'read',
					expires: '01-01-2030'
				});

				imageUrls.push(url);
			}

			updateData.images = imageUrls;
		}

		await docRef.update(updateData);

		const updated = await docRef.get();

		return json({
			id: updated.id,
			...updated.data()
		});
	} catch (error) {
		console.error(error);

		return json(
			{ message: 'Server error' },
			{ status: 500 }
		);
	}
}

export async function DELETE({ params, locals }) {
	try {
		if (!locals.user) {
			return json(
				{ message: 'Authentication required' },
				{ status: 401 }
			);
		}

		const docRef = db.collection('properties').doc(params.id);
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

		if (property.images) {
			for (const imageUrl of property.images) {
				try {
					const fileName = imageUrl.split('/').pop().split('?')[0];
					await bucket.file(`properties/${fileName}`).delete();
				} catch {}
			}
		}

		await docRef.delete();

		return json({
			message: 'Property deleted successfully'
		});
	} catch (error) {
		console.error(error);

		return json(
			{ message: 'Server error' },
			{ status: 500 }
		);
	}
}