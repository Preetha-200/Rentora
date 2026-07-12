import { json } from '@sveltejs/kit';
import { db } from '$lib/server/firebase';

function validateComplaint(propertyId, complaint) {
	if (!propertyId || !complaint?.trim()) {
		return 'Property ID and complaint are required';
	}

	return null;
}

async function getProperty(propertyId) {
	const propertyRef = db.collection('properties').doc(propertyId);
	const propertyDoc = await propertyRef.get();

	if (!propertyDoc.exists) {
		return null;
	}

	return {
		id: propertyDoc.id,
		...propertyDoc.data()
	};
}

async function createComplaint(property, tenantId, complaint) {
	const now = new Date().toISOString();

	const complaintRef = db.collection('maintenance').doc();

	const maintenance = {
		propertyId: property.id,
		propertyTitle: property.title,
		ownerId: property.ownerId,
		tenantId,
		complaint,
		status: 'Pending',
		createdAt: now,
		updatedAt: now
	};

	await complaintRef.set(maintenance);

	return {
		id: complaintRef.id,
		...maintenance
	};
}

async function notifyOwner(property) {
	await db.collection('notifications').add({
		userId: property.ownerId,
		title: 'New Maintenance Request',
		message: `Complaint received for "${property.title}".`,
		type: 'MAINTENANCE_REQUEST',
		read: false,
		createdAt: new Date().toISOString()
	});
}

async function getOwnerComplaints(ownerId) {
	const snapshot = await db
		.collection('maintenance')
		.where('ownerId', '==', ownerId)
		.orderBy('createdAt', 'desc')
		.get();

	return snapshot.docs.map((doc) => ({
		id: doc.id,
		...doc.data()
	}));
}

async function getTenantComplaints(tenantId) {
	const snapshot = await db
		.collection('maintenance')
		.where('tenantId', '==', tenantId)
		.orderBy('createdAt', 'desc')
		.get();

	return snapshot.docs.map((doc) => ({
		id: doc.id,
		...doc.data()
	}));
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

		const { propertyId, complaint } = await request.json();

		const validationError = validateComplaint(
			propertyId,
			complaint
		);

		if (validationError) {
			return json(
				{
					message: validationError
				},
				{
					status: 400
				}
			);
		}

		const property = await getProperty(propertyId);

		if (!property) {
			return json(
				{
					message: 'Property not found'
				},
				{
					status: 404
				}
			);
		}

		const maintenance = await createComplaint(
			property,
			locals.user.id,
			complaint.trim()
		);

		await notifyOwner(property);

		return json(maintenance, {
			status: 201
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

export async function GET({ locals }) {
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

		let complaints = [];

		if (locals.user.role === 'owner') {
			complaints = await getOwnerComplaints(locals.user.id);
		} else if (locals.user.role === 'tenant') {
			complaints = await getTenantComplaints(locals.user.id);
		} else {
			return json(
				{
					message: 'Unauthorized'
				},
				{
					status: 403
				}
			);
		}

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