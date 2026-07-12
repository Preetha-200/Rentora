import { json } from '@sveltejs/kit';
import { db } from '$lib/server/firebase';

export async function GET({ url, locals }) {
	try {
		if (!locals.user || locals.user.role !== 'admin') {
			return json(
				{
					message: 'Unauthorized'
				},
				{
					status: 403
				}
			);
		}

		const deleteRequests = url.searchParams.get('deleteRequests');
		const status = url.searchParams.get('status') || 'Pending';

		let snapshot;

		if (deleteRequests === 'true') {
			snapshot = await db
				.collection('properties')
				.where('deleteRequested', '==', true)
				.get();
		} else {
			snapshot = await db
				.collection('properties')
				.where('approvalStatus', '==', status)
				.get();
		}

		const properties = await Promise.all(
			snapshot.docs.map(async (doc) => {
				const property = {
					id: doc.id,
					...doc.data()
				};

				if (property.ownerId) {
					const ownerDoc = await db
						.collection('users')
						.doc(property.ownerId)
						.get();

					property.ownerName = ownerDoc.exists
						? ownerDoc.data().name
						: 'Unknown Owner';
				}

				return property;
			})
		);

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

export async function PUT({ request, locals }) {
	try {
		if (!locals.user || locals.user.role !== 'admin') {
			return json(
				{
					message: 'Unauthorized'
				},
				{
					status: 403
				}
			);
		}

		const {
			propertyId,
			action,
			reason = ''
		} = await request.json();

		const propertyRef = db.collection('properties').doc(propertyId);

		const propertySnap = await propertyRef.get();

		if (!propertySnap.exists) {
			return json(
				{
					message: 'Property not found'
				},
				{
					status: 404
				}
			);
		}

		const property = propertySnap.data();

		const batch = db.batch();
				if (action === 'approve') {
			batch.update(propertyRef, {
				approvalStatus: 'Approved',
				status: 'Available',
				approvedBy: locals.user.id,
				approvedAt: new Date().toISOString(),
				updatedAt: new Date().toISOString()
			});
		}

		if (action === 'reject') {
			batch.update(propertyRef, {
				approvalStatus: 'Rejected',
				approvalReason: reason,
				approvedBy: locals.user.id,
				approvedAt: new Date().toISOString(),
				updatedAt: new Date().toISOString()
			});
		}

		if (action === 'approveDelete') {
			batch.delete(propertyRef);
		}

		if (action === 'rejectDelete') {
			batch.update(propertyRef, {
				deleteRequested: false,
				updatedAt: new Date().toISOString()
			});
		}

		const notificationRef = db.collection('notifications').doc();

		let message = '';

		switch (action) {
			case 'approve':
				message = `Your property "${property.title}" has been approved.`;
				break;

			case 'reject':
				message = `Your property "${property.title}" was rejected.${reason ? ` Reason: ${reason}` : ''}`;
				break;

			case 'approveDelete':
				message = `Your property "${property.title}" has been deleted after admin approval.`;
				break;

			case 'rejectDelete':
				message = `Your request to delete "${property.title}" has been rejected.`;
				break;
		}

		batch.set(notificationRef, {
			userId: property.ownerId,
			title: 'Property Update',
			message,
			type: 'PROPERTY',
			propertyId,
			read: false,
			createdAt: new Date().toISOString()
		});

		const approvalSnapshot = await db
			.collection('approvalRequests')
			.where('propertyId', '==', propertyId)
			.where('status', '==', 'Pending')
			.get();

		approvalSnapshot.forEach((doc) => {
			batch.update(doc.ref, {
				status:
					action === 'approve'
						? 'Approved'
						: action === 'reject'
							? 'Rejected'
							: action,
				processedBy: locals.user.id,
				processedAt: new Date().toISOString(),
				reason
			});
		});

		await batch.commit();

		return json({
			message: 'Action completed successfully.'
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