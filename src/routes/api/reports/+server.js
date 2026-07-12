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

		const ownerId = locals.user.id;

		const [
			propertiesSnap,
			requestsSnap,
			paymentsSnap,
			maintenanceSnap
		] = await Promise.all([
			db.collection('properties')
				.where('ownerId', '==', ownerId)
				.get(),

			db.collection('requests')
				.where('ownerId', '==', ownerId)
				.get(),

			db.collection('payments')
				.where('ownerId', '==', ownerId)
				.get(),

			db.collection('maintenance')
				.where('ownerId', '==', ownerId)
				.get()
		]);

		const properties = propertiesSnap.docs.map((d) => d.data());
		const requests = requestsSnap.docs.map((d) => d.data());
		const payments = paymentsSnap.docs.map((d) => d.data());
		const maintenance = maintenanceSnap.docs.map((d) => d.data());

		const report = {
			totalProperties: properties.length,
			approvedProperties: properties.filter(
				(p) => p.approvalStatus === 'Approved'
			).length,
			pendingProperties: properties.filter(
				(p) => p.approvalStatus === 'Pending'
			).length,
			totalRequests: requests.length,
			pendingRequests: requests.filter(
				(r) => r.status === 'Pending'
			).length,
			acceptedRequests: requests.filter(
				(r) => r.status === 'Accepted'
			).length,
			rejectedRequests: requests.filter(
				(r) => r.status === 'Rejected'
			).length,
            			totalPayments: payments.length,
			paidPayments: payments.filter(
				(p) => p.status === 'Paid'
			).length,
			pendingPayments: payments.filter(
				(p) => p.status === 'Pending'
			).length,
			totalRevenue: payments
				.filter((p) => p.status === 'Paid')
				.reduce(
					(sum, p) => sum + Number(p.amount || 0),
					0
				),
			totalMaintenance: maintenance.length,
			openMaintenance: maintenance.filter(
				(m) => m.status !== 'Completed'
			).length,
			completedMaintenance: maintenance.filter(
				(m) => m.status === 'Completed'
			).length
		};

		return json(report);
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