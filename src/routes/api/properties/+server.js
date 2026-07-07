import { json } from '@sveltejs/kit';
import { db, bucket } from '$lib/server/firebase';

async function createDefaultPropertiesForOwner(ownerId) {
	const defaultProperties = [
		{
			title: 'Spacious 3BHK Apartment',
			description: 'A modern apartment with great city views.',
			address: '123 Main Street',
			city: 'Mumbai',
			rent: 25000,
			bedrooms: 3,
			bathrooms: 2,
			furnishing: 'Fully Furnished',
			amenities: ['WiFi', 'Parking', 'AC', 'Gym'],
			ownerId,
			status: 'available',
			images: ['https://via.placeholder.com/400x300?text=Apartment+1'],
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString()
		},
		{
			title: 'Cozy 2BHK Apartment',
			description: 'Perfect for small families.',
			address: '45 Lake View Road',
			city: 'Chennai',
			rent: 18000,
			bedrooms: 2,
			bathrooms: 2,
			furnishing: 'Semi Furnished',
			amenities: ['Parking', 'Lift'],
			ownerId,
			status: 'available',
			images: ['https://via.placeholder.com/400x300?text=Apartment+2'],
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString()
		},
		{
			title: 'Luxury Villa',
			description: 'Premium villa with private garden.',
			address: '78 Green Valley',
			city: 'Bangalore',
			rent: 55000,
			bedrooms: 4,
			bathrooms: 4,
			furnishing: 'Fully Furnished',
			amenities: ['WiFi', 'Parking', 'Pool', 'Garden'],
			ownerId,
			status: 'available',
			images: ['https://via.placeholder.com/400x300?text=Villa'],
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString()
		}
	];

	const batch = db.batch();

	defaultProperties.forEach((property) => {
		const doc = db.collection('properties').doc();
		batch.set(doc, property);
	});

	await batch.commit();
}

export async function GET({ url, locals }) {
	try {
		const status = url.searchParams.get('status');
		const mine = url.searchParams.get('mine');

		if (mine === 'true') {
			if (!locals.user) {
				return json(
					{ message: 'Authentication required' },
					{ status: 401 }
				);
			}

			let query = db
				.collection('properties')
				.where('ownerId', '==', locals.user.id);

			let snapshot = await query.get();

			let properties = snapshot.docs.map((doc) => ({
				id: doc.id,
				...doc.data()
			}));

			if (properties.length === 0) {
				await createDefaultPropertiesForOwner(locals.user.id);

				snapshot = await query.get();

				properties = snapshot.docs.map((doc) => ({
					id: doc.id,
					...doc.data()
				}));
			}

			return json(properties);
		}

		let query = db.collection('properties');

		if (status) {
			query = query.where('status', '==', status);
		}

		const snapshot = await query.get();

		const properties = snapshot.docs.map((doc) => ({
			id: doc.id,
			...doc.data()
		}));

		return json(properties);
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

export async function POST({ request, locals }) {
	try {
		if (!locals.user) {
			return json(
				{ message: 'Authentication required' },
				{ status: 401 }
			);
		}

		const data = await request.formData();

		const title = data.get('title');
		const description = data.get('description');
		const address = data.get('address');
		const city = data.get('city');
		const rent = Number(data.get('rent'));
		const bedrooms = Number(data.get('bedrooms'));
		const bathrooms = Number(data.get('bathrooms'));
		const furnishing = data.get('furnishing');

		const amenities =
			data.get('amenities')?.split(',').map((a) => a.trim()) || [];

		const files = data.getAll('images');

		const docRef = db.collection('properties').doc();

		const imageUrls = [];

		for (const file of files) {
			if (!file.name) continue;

			const bytes = Buffer.from(await file.arrayBuffer());

			const fileName = `${docRef.id}_${Date.now()}_${file.name}`;

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

		const property = {
			title,
			description,
			address,
			city,
			rent,
			bedrooms,
			bathrooms,
			furnishing,
			amenities,
			ownerId: locals.user.id,
			status: 'available',
			images: imageUrls,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString()
		};

		await docRef.set(property);

		return json(
			{
				id: docRef.id,
				...property
			},
			{
				status: 201
			}
		);
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