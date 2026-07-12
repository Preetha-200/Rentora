import { json } from '@sveltejs/kit';
import { db, bucket } from '$lib/server/firebase';

const MAX_IMAGES = 6;

function validateProperty(data) {
	const errors = [];

	if (!data.title?.trim()) errors.push('Property title is required.');
	if (!data.address?.trim()) errors.push('Property address is required.');
	if (!data.city?.trim()) errors.push('City is required.');

	if (Number(data.rent) <= 0)
		errors.push('Rent must be greater than zero.');

	if (Number(data.bedrooms) < 1)
		errors.push('Bedrooms must be at least 1.');

	if (Number(data.bathrooms) < 1)
		errors.push('Bathrooms must be at least 1.');

	return errors;
}

async function uploadImages(propertyId, files) {
	const imageUrls = [];

	for (const file of files) {
		if (!file?.name) continue;

		const bytes = Buffer.from(await file.arrayBuffer());

		const filename =
			`${propertyId}_${Date.now()}_${Math.random()
				.toString(36)
				.substring(2)}_${file.name}`;

		const storageFile = bucket.file(`properties/${filename}`);

		await storageFile.save(bytes, {
			metadata: {
				contentType: file.type
			}
		});

		const [url] = await storageFile.getSignedUrl({
			action: 'read',
			expires: '01-01-2035'
		});

		imageUrls.push(url);
	}

	return imageUrls;
}

async function createDefaultPropertiesForOwner(ownerId) {
	const defaults = [
		{
			title: 'Luxury Apartment',
			description: 'Modern apartment with balcony',
			address: 'MG Road',
			city: 'Bangalore',
			rent: 25000,
			bedrooms: 2,
			bathrooms: 2,
			furnishing: 'Fully Furnished',
			amenities: ['Parking', 'WiFi'],
			ownerId,

			status: 'Approved',

			totalUnits: 5,
			vacancyCount: 5,
			tenantCount: 0,

			occupancyStatus: 'Available',

			deleteRequested: false,

			approvalStatus: 'Approved',

			images: [
				'https://via.placeholder.com/900x600?text=Luxury+Apartment'
			],

			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString()
		}
	];

	const batch = db.batch();

	defaults.forEach((property) => {
		const ref = db.collection('properties').doc();
		batch.set(ref, property);
	});

	await batch.commit();
}
export async function GET({ url, locals }) {
	try {
		const mine = url.searchParams.get('mine');
		const status = url.searchParams.get('status');

		if (mine === 'true') {
			if (!locals.user) {
				return json(
					{
						message: 'Authentication required'
					},
					{
						status: 401
					}
				);
			}

			let query = db
				.collection('properties')
				.where('ownerId', '==', locals.user.id);

			let snapshot = await query.get();

			if (snapshot.empty) {
				await createDefaultPropertiesForOwner(locals.user.id);

				snapshot = await query.get();
			}

			const properties = snapshot.docs.map((doc) => ({
				id: doc.id,
				...doc.data()
			}));

			return json(properties);
		}

		let query = db.collection('properties');

		if (status) {
			query = query.where('approvalStatus', '==', status);
		} else {
			query = query.where('approvalStatus', '==', 'Approved');
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
				{
					message: 'Authentication required'
				},
				{
					status: 401
				}
			);
		}

		const formData = await request.formData();

		const propertyData = {
			title: formData.get('title'),
			description: formData.get('description'),
			address: formData.get('address'),
			city: formData.get('city'),
			rent: Number(formData.get('rent')),
			bedrooms: Number(formData.get('bedrooms')),
			bathrooms: Number(formData.get('bathrooms')),
			furnishing: formData.get('furnishing'),
			amenities:
				formData.get('amenities')
					?.split(',')
					.map((a) => a.trim())
					.filter(Boolean) || []
		};

		const validationErrors = validateProperty(propertyData);

		if (validationErrors.length) {
			return json(
				{
					message: validationErrors.join(' ')
				},
				{
					status: 400
				}
			);
		}

		const files = formData
			.getAll('images')
			.filter((file) => file && file.name);

		if (files.length === 0) {
			return json(
				{
					message: 'Please upload at least one property image.'
				},
				{
					status: 400
				}
			);
		}

		if (files.length > MAX_IMAGES) {
			return json(
				{
					message: `Maximum ${MAX_IMAGES} images are allowed.`
				},
				{
					status: 400
				}
			);
		}

		const propertyRef = db.collection('properties').doc();

		const imageUrls = await uploadImages(propertyRef.id, files);

		const now = new Date().toISOString();

		const property = {
			...propertyData,

			ownerId: locals.user.id,
			ownerName: locals.user.name,
			ownerEmail: locals.user.email,

			images: imageUrls,

			approvalStatus: 'Pending',
			approvalReason: '',
			approvedBy: '',
			approvedAt: null,

			deleteRequested: false,
			deleteApproved: false,

			totalUnits: Number(formData.get('totalUnits')) || 1,
			vacancyCount: Number(formData.get('totalUnits')) || 1,
			tenantCount: 0,

			status: 'Available',

			createdAt: now,
			updatedAt: now
		};
        const approvalRef = db.collection('approvalRequests').doc();

		const admins = await db
			.collection('users')
			.where('role', '==', 'admin')
			.get();

		const batch = db.batch();

		batch.set(propertyRef, property);

		batch.set(approvalRef, {
			propertyId: propertyRef.id,
			propertyTitle: property.title,

			ownerId: locals.user.id,
			ownerName: locals.user.name,
			ownerEmail: locals.user.email,

			status: 'Pending',

			requestType: 'CREATE',

			createdAt: now
		});

		admins.forEach((adminDoc) => {
			const notificationRef = db.collection('notifications').doc();

			batch.set(notificationRef, {
				userId: adminDoc.id,

				title: 'New Property Approval',

				message: `${locals.user.name} submitted "${property.title}" for approval.`,

				type: 'PROPERTY_APPROVAL',

				propertyId: propertyRef.id,

				read: false,

				createdAt: now
			});
		});

		await batch.commit();

		return json(
			{
				message:
					'Property submitted successfully. Waiting for admin approval.',
				id: propertyRef.id
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