import { json } from '@sveltejs/kit';
import { db } from '$lib/server/firebase';

export async function GET({ locals }) {
	try {
		if (!locals.user) {
			return json(
				{ message: 'Authentication required' },
				{ status: 401 }
			);
		}

		const snapshot = await db
			.collection('rentalRequests')
			.where('ownerId', '==', locals.user.id)
			.where('status', '==', 'Pending')
			.get();

		const requests = await Promise.all(snapshot.docs.map(async (doc) => {
			const request = {
				id: doc.id,
				...doc.data()
			};
			const tenantDoc = await db.collection('users').doc(request.tenantId).get();
			if (tenantDoc.exists) {
				request.tenantName = tenantDoc.data().name || 'Unknown';
				request.tenantEmail = tenantDoc.data().email || '';
				request.tenantPhone = tenantDoc.data().phone || '';
			}
			const propertyDoc = await db.collection('properties').doc(request.propertyId).get();
			if (propertyDoc.exists) {
				const property = propertyDoc.data();
				request.propertyAddress = property.address || '';
				request.propertyCity = property.city || '';
				request.propertyRent = property.rent || 0;
				request.propertyImage = property.images?.[0] || '';
			}
			return request;
		}));

		requests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

		return json(requests);
	} catch (error) {
		console.error(error);
		return json(
			{ message: error.message },
			{ status: 500 }
		);
	}
}