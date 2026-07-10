import { json } from '@sveltejs/kit';
import { db } from '$lib/server/firebase';

// ==========================
// Tenant -> Raise Complaint
// ==========================
export async function POST({ request, locals }) {
	try {
		if (!locals.user) {
			return json(
				{ message: 'Authentication required' },
				{ status: 401 }
			);
		}

		const { propertyId, complaint } = await request.json();

		if (!propertyId || !complaint) {
			return json(
				{
					message: 'Property ID and complaint are required'
				},
				{
					status: 400
				}
			);
		}

		const propertyDoc = await db
			.collection('properties')
			.doc(propertyId)
			.get();

		if (!propertyDoc.exists) {
			return json(
				{ message: 'Property not found' },
				{ status: 404 }
			);
		}

		const property = propertyDoc.data();

		const complaintRef = db.collection('maintenance').doc();

		const maintenance = {
			propertyId,
			propertyTitle: property.title,
			ownerId: property.ownerId,
			tenantId: locals.user.id,

			complaint,

			status: 'Pending',

			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString()
		};

		await complaintRef.set(maintenance);

		// Notify owner
		await db.collection('notifications').add({
			userId: property.ownerId,
			title: 'New Maintenance Request',
			message: `Complaint received for "${property.title}".`,
			type: 'MAINTENANCE_REQUEST',
			isRead: false,
			createdAt: new Date().toISOString()
		});

		return json(
			{
				id: complaintRef.id,
				...maintenance
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

// ==========================
// Owner -> View Complaints
// ==========================
export async function GET({ locals }) {
	try {
		if (!locals.user) {
			return json(
				{ message: 'Authentication required' },
				{ status: 401 }
			);
		}

		const snapshot = await db
			.collection('maintenance')
			.where('ownerId', '==', locals.user.id)
			.orderBy('createdAt', 'desc')
			.get();

		const complaints = snapshot.docs.map((doc) => ({
			id: doc.id,
			...doc.data()
		}));

		return json({
			total: complaints.length,
			complaints
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