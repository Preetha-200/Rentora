import { json } from '@sveltejs/kit';
import { db } from '$lib/server/firebase';

// This is an additive, RESTful counterpart to the existing PUT
// /api/admin/property-approval (action: 'approveDelete') workflow, which is
// left completely untouched. That PUT-based approve/reject flow remains the
// only way to *request and approve* a deletion; this DELETE endpoint is a
// second, standards-compliant entry point for performing the actual removal
// of a property that has ALREADY been approved for deletion — it still
// requires deleteRequested === true and an admin, so it never bypasses the
// approval workflow.
export async function DELETE({ params, locals }) {
	try {
		if (!locals.user || locals.user.role !== 'admin') {
			return json({ message: 'Unauthorized' }, { status: 403 });
		}

		const propertyRef = db.collection('properties').doc(params.id);
		const propertySnap = await propertyRef.get();

		if (!propertySnap.exists) {
			return json({ message: 'Property not found' }, { status: 404 });
		}

		const property = propertySnap.data();

		if (!property.deleteRequested) {
			return json(
				{ message: 'This property has no pending, admin-approved delete request.' },
				{ status: 400 }
			);
		}

		const batch = db.batch();

		batch.delete(propertyRef);

		batch.set(db.collection('notifications').doc(), {
			userId: property.ownerId,
			title: 'Property Deleted',
			message: `Your property "${property.title}" has been deleted after admin approval.`,
			type: 'PROPERTY',
			read: false,
			createdAt: new Date().toISOString()
		});

		await batch.commit();

		return json({ message: 'Property deleted successfully.' });
	} catch (error) {
		console.error(error);
		return json({ message: error.message }, { status: 500 });
	}
}
