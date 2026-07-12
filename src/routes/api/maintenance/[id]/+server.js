import { json } from '@sveltejs/kit';
import { db } from '$lib/server/firebase';

// RESTful partial-update endpoint: PATCH /api/maintenance/[id] with
// { status }. Same validated Pending -> Checking -> Resolved state machine
// as the older POST /api/maintenance/update-status endpoint (kept working
// for backward compatibility) — this is the "only a few fields change"
// PATCH candidate called out for maintenance status.
export async function PATCH({ params, request, locals }) {
	try {
		if (!locals.user) {
			return json(
				{ message: 'Authentication required' },
				{ status: 401 }
			);
		}

		const { status } = await request.json();

		if (!status) {
			return json(
				{ message: 'status is required.' },
				{ status: 400 }
			);
		}

		const complaintRef = db.collection('maintenance').doc(params.id);
		const snapshot = await complaintRef.get();

		if (!snapshot.exists) {
			return json(
				{ message: 'Complaint not found.' },
				{ status: 404 }
			);
		}

		const complaint = snapshot.data();
		const now = new Date().toISOString();
		const batch = db.batch();

		if (status === 'Checking') {
			if (complaint.ownerId !== locals.user.id) {
				return json({ message: 'Not authorized.' }, { status: 403 });
			}

			if (complaint.status !== 'Pending') {
				return json(
					{ message: 'Only pending complaints can be marked as Checking.' },
					{ status: 400 }
				);
			}

			batch.update(complaintRef, { status: 'Checking', updatedAt: now });

			batch.set(db.collection('notifications').doc(), {
				userId: complaint.tenantId,
				title: 'Maintenance Update',
				message: `Your maintenance request for "${complaint.propertyTitle}" is now being checked by the owner.`,
				type: 'MAINTENANCE',
				read: false,
				createdAt: now
			});
		} else if (status === 'Resolved') {
			if (complaint.tenantId !== locals.user.id) {
				return json({ message: 'Not authorized.' }, { status: 403 });
			}

			if (complaint.status !== 'Checking') {
				return json(
					{ message: 'Complaint must be in Checking state before resolving.' },
					{ status: 400 }
				);
			}

			batch.update(complaintRef, {
				status: 'Resolved',
				resolvedAt: now,
				updatedAt: now
			});

			batch.set(db.collection('notifications').doc(), {
				userId: complaint.ownerId,
				title: 'Maintenance Completed',
				message: `The tenant confirmed that "${complaint.propertyTitle}" has been resolved.`,
				type: 'MAINTENANCE',
				read: false,
				createdAt: now
			});
		} else {
			return json(
				{ message: 'Status must be either "Checking" or "Resolved".' },
				{ status: 400 }
			);
		}

		await batch.commit();

		return json({ message: 'Maintenance status updated successfully.' });
	} catch (error) {
		console.error(error);
		return json({ message: error.message }, { status: 500 });
	}
}
