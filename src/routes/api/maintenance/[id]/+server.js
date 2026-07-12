import { json } from '@sveltejs/kit';
import { db } from '$lib/server/firebase';

export async function PATCH({ params, request, locals }) {
	try {
		if (!locals.user) {
			return json({ message: 'Authentication required' }, { status: 401 });
		}

		const { status } = await request.json();
		const ownerStatuses = ['In Progress', 'Fixed'];
		const tenantStatuses = ['Resolved'];
		const allValid = [...ownerStatuses, ...tenantStatuses, 'Pending'];

		if (!allValid.includes(status)) {
			return json({ message: `Invalid status. Valid values: ${allValid.join(', ')}` }, { status: 400 });
		}

		const docRef = db.collection('maintenance').doc(params.id);
		const snapshot = await docRef.get();

		if (!snapshot.exists) {
			return json({ message: 'Maintenance issue not found' }, { status: 404 });
		}

		const issue = snapshot.data();

		// Role-based authorization
		if (locals.user.role === 'owner') {
			if (issue.ownerId !== locals.user.id) {
				return json({ message: 'Not authorized' }, { status: 403 });
			}
			if (!ownerStatuses.includes(status)) {
				return json({ message: 'Owners can only set: In Progress, Fixed' }, { status: 400 });
			}
		} else if (locals.user.role === 'tenant') {
			if (issue.tenantId !== locals.user.id) {
				return json({ message: 'Not authorized' }, { status: 403 });
			}
			if (status !== 'Resolved') {
				return json({ message: 'Tenants can only resolve issues' }, { status: 400 });
			}
			if (issue.status !== 'Fixed') {
				return json(
					{ message: 'Can only resolve issues marked as Fixed by the owner first' },
					{ status: 400 }
				);
			}
		} else {
			return json({ message: 'Not authorized' }, { status: 403 });
		}

		const batch = db.batch();
		batch.update(docRef, { status, updatedAt: new Date().toISOString() });

		// Send notification to relevant party
		const notifRef = db.collection('notifications').doc();
		if (status === 'Fixed') {
			batch.set(notifRef, {
				userId: issue.tenantId,
				title: 'Maintenance Issue Fixed',
				message: `Your maintenance request for "${issue.propertyTitle}" has been marked as fixed. Please confirm resolution.`,
				type: 'MAINTENANCE_FIXED',
				read: false,
				createdAt: new Date().toISOString()
			});
		} else if (status === 'Resolved') {
			batch.set(notifRef, {
				userId: issue.ownerId,
				title: 'Maintenance Issue Resolved',
				message: `Tenant confirmed the maintenance issue for "${issue.propertyTitle}" is resolved and closed.`,
				type: 'MAINTENANCE_RESOLVED',
				read: false,
				createdAt: new Date().toISOString()
			});
		} else if (status === 'In Progress') {
			batch.set(notifRef, {
				userId: issue.tenantId,
				title: 'Maintenance In Progress',
				message: `The owner has started working on your maintenance request for "${issue.propertyTitle}".`,
				type: 'MAINTENANCE_IN_PROGRESS',
				read: false,
				createdAt: new Date().toISOString()
			});
		}

		await batch.commit();
		return json({ message: 'Status updated successfully', status });
	} catch (error) {
		console.error(error);
		return json({ message: error.message }, { status: 500 });
	}
}
