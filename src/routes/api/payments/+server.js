import { json } from '@sveltejs/kit';
import { db } from '$lib/server/firebase';

// ==========================
// Tenant - View Payments
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
			.collection('payments')
			.where('tenantId', '==', locals.user.id)
			.orderBy('createdAt', 'desc')
			.get();

		const payments = snapshot.docs.map((doc) => ({
			id: doc.id,
			...doc.data()
		}));

		return json({
			total: payments.length,
			payments
		});
	} catch (error) {
		console.error(error);
		return json(
			{ message: error.message },
			{ status: 500 }
		);
	}
}

// ==========================
// Tenant - Pay Rent
// ==========================
export async function POST({ request, locals }) {
	try {
		if (!locals.user) {
			return json(
				{ message: 'Authentication required' },
				{ status: 401 }
			);
		}

		const { paymentId } = await request.json();

		if (!paymentId) {
			return json(
				{ message: 'Payment ID is required' },
				{ status: 400 }
			);
		}

		const paymentRef = db.collection('payments').doc(paymentId);
		const snapshot = await paymentRef.get();

		if (!snapshot.exists) {
			return json(
				{ message: 'Payment not found' },
				{ status: 404 }
			);
		}

		const payment = snapshot.data();

		if (payment.tenantId !== locals.user.id) {
			return json(
				{ message: 'Not authorized' },
				{ status: 403 }
			);
		}

		if (payment.status === 'Paid') {
			return json({
				message: 'Payment already completed.'
			});
		}
        		const now = new Date().toISOString();
		const batch = db.batch();

		batch.update(paymentRef, {
			status: 'Paid',
			paidAt: now,
			updatedAt: now
		});

		const notificationRef = db.collection('notifications').doc();

		batch.set(notificationRef, {
			userId: payment.ownerId,
			title: 'Rent Payment Received',
			message: `${payment.tenantName} has paid rent for "${payment.propertyTitle}".`,
			type: 'PAYMENT_RECEIVED',
			propertyId: payment.propertyId,
			read: false,
			createdAt: now
		});

		await batch.commit();

		return json({
			message: 'Rent payment completed successfully.'
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