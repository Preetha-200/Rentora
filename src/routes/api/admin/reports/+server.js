import { json } from '@sveltejs/kit';
import { db } from '$lib/server/firebase';

export async function GET({ locals }) {
	try {
		if (!locals.user || locals.user.role !== 'admin') {
			return json({ message: 'Unauthorized' }, { status: 403 });
		}

		const [
			usersSnap,
			propertiesSnap,
			requestsSnap,
			maintenanceSnap,
			paymentsSnap
		] = await Promise.all([
			db.collection('users').get(),
			db.collection('properties').get(),
			db.collection('rentalRequests').get(),
			db.collection('maintenance').get(),
			db.collection('payments').get()
		]);

		const users = usersSnap.docs.map((d) => d.data());
		const properties = propertiesSnap.docs.map((d) => d.data());
		const requests = requestsSnap.docs.map((d) => d.data());
		const maintenance = maintenanceSnap.docs.map((d) => d.data());
		const payments = paymentsSnap.docs.map((d) => d.data());

		const countBy = (list, field, value) =>
			list.filter((item) => item[field] === value).length;

		return json({
			totalUsers: users.length,
			totalOwners: countBy(users, 'role', 'owner'),
			totalTenants: countBy(users, 'role', 'tenant'),

			totalProperties: properties.length,
			approvedProperties: countBy(properties, 'approvalStatus', 'Approved'),
			pendingProperties: countBy(properties, 'approvalStatus', 'Pending'),
			rejectedProperties: countBy(properties, 'approvalStatus', 'Rejected'),

			totalRequests: requests.length,
			approvedRequests: countBy(requests, 'status', 'Approved'),
			rejectedRequests: countBy(requests, 'status', 'Rejected'),
			pendingRequests: countBy(requests, 'status', 'Pending'),

			totalMaintenance: maintenance.length,
			completedMaintenance: countBy(maintenance, 'status', 'Resolved'),
			openMaintenance: maintenance.filter((m) => m.status !== 'Resolved').length,

			totalPayments: payments.length,
			paidPayments: countBy(payments, 'status', 'Paid'),
			pendingPayments: countBy(payments, 'status', 'Pending'),

			totalRevenue: payments
				.filter((p) => p.status === 'Paid')
				.reduce((sum, p) => sum + Number(p.amount || 0), 0)
		});
	} catch (error) {
		console.error(error);
		return json({ message: error.message }, { status: 500 });
	}
}
