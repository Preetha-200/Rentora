import { fail } from '@sveltejs/kit';
import { auth as adminAuth, db } from '$lib/server/firebase';

// Form actions run as plain POST requests and never carry the custom
// `Authorization` header our client `api.js` normally attaches — SvelteKit
// actions don't have access to that fetch wrapper. So each action reads a
// Firebase ID token out of the submitted form data instead (see the hidden
// `token` field in +page.svelte) and verifies it itself with the Admin SDK,
// rather than relying on `locals.user` (which hooks.server.js can only
// populate from a real Authorization header).
async function verifyAdmin(token) {
	if (!token) {
		return { ok: false, error: 'Not authenticated.' };
	}

	try {
		const decoded = await adminAuth.verifyIdToken(token);
		const userDoc = await db.collection('users').doc(decoded.uid).get();

		if (!userDoc.exists || userDoc.data().role !== 'admin') {
			return { ok: false, error: 'Admin access required.' };
		}

		return { ok: true, uid: decoded.uid };
	} catch {
		return { ok: false, error: 'Session expired. Please refresh and try again.' };
	}
}

async function notifyOwner(propertyRef, propertyTitle, ownerId, message) {
	await db.collection('notifications').add({
		userId: ownerId,
		title: 'Property Update',
		message,
		type: 'PROPERTY',
		propertyId: propertyRef.id,
		read: false,
		createdAt: new Date().toISOString()
	});
}

export const actions = {
	// Default action: approve a pending property.
	default: async ({ request }) => {
		const formData = await request.formData();
		const token = formData.get('token');
		const propertyId = formData.get('propertyId');

		const auth = await verifyAdmin(token);
		if (!auth.ok) return fail(403, { message: auth.error });

		const propertyRef = db.collection('properties').doc(propertyId);
		const propertySnap = await propertyRef.get();

		if (!propertySnap.exists) {
			return fail(404, { message: 'Property not found.' });
		}

		const property = propertySnap.data();

		await propertyRef.update({
			approvalStatus: 'Approved',
			status: 'Available',
			approvedBy: auth.uid,
			approvedAt: new Date().toISOString(),
			updatedAt: new Date().toISOString()
		});

		await notifyOwner(
			propertyRef,
			property.title,
			property.ownerId,
			`Your property "${property.title}" has been approved.`
		);

		return { success: true, action: 'approve' };
	},

	// Named action: reject a pending property with a reason.
	reject: async ({ request }) => {
		const formData = await request.formData();
		const token = formData.get('token');
		const propertyId = formData.get('propertyId');
		const reason = (formData.get('reason') || '').toString().trim();

		const auth = await verifyAdmin(token);
		if (!auth.ok) return fail(403, { message: auth.error });

		if (!reason) {
			return fail(400, { message: 'Please enter a rejection reason.' });
		}

		const propertyRef = db.collection('properties').doc(propertyId);
		const propertySnap = await propertyRef.get();

		if (!propertySnap.exists) {
			return fail(404, { message: 'Property not found.' });
		}

		const property = propertySnap.data();

		await propertyRef.update({
			approvalStatus: 'Rejected',
			approvalReason: reason,
			approvedBy: auth.uid,
			approvedAt: new Date().toISOString(),
			updatedAt: new Date().toISOString()
		});

		await notifyOwner(
			propertyRef,
			property.title,
			property.ownerId,
			`Your property "${property.title}" was rejected. Reason: ${reason}`
		);

		return { success: true, action: 'reject' };
	}
};
