import { json } from '@sveltejs/kit';
import { db } from '$lib/server/firebase';

export async function POST({ request, locals }) {
	try {
		if (!locals.user) {
			return json(
				{ message: 'Authentication required' },
				{ status: 401 }
			);
		}

		const { complaintId, status } = await request.json();

		if (!complaintId || !status) {
			return json(
				{
					message: 'Complaint ID and status are required'
				},
				{
					status: 400
				}
			);
		}

		const validStatuses = [
			'Pending',
			'In Progress',
			'Completed'
		];

		if (!validStatuses.includes(status)) {
			return json(
				{
					message: 'Invalid status'
				},
				{
					status: 400
				}
			);
		}

		const complaintRef = db.collection('maintenance').doc(complaintId);
		const snapshot = await complaintRef.get();

		if (!snapshot.exists) {
			return json(
				{
					message: 'Complaint not found'
				},
				{
					status: 404
				}
			);
		}

		const complaint = snapshot.data();

		// Only owner can update
		if (complaint.ownerId !== locals.user.id) {
			return json(
				{
					message: 'Not authorized'
				},
				{
					status: 403
				}
			);
		}

		await complaintRef.update({
			status,
			updatedAt: new Date().toISOString()
		});

		// Notify Tenant
		await db.collection('notifications').add({
			userId: complaint.tenantId,
			title: 'Maintenance Status Updated',
			message: `Your complaint for "${complaint.propertyTitle}" is now "${status}".`,
			type: 'COMPLAINT_UPDATED',
			isRead: false,
			createdAt: new Date().toISOString()
		});

		return json({
			message: 'Complaint status updated successfully'
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