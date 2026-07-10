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

		const {
			requestId,
			startDate,
			endDate,
			monthlyRent,
			securityDeposit
		} = await request.json();

		if (
			!requestId ||
			!startDate ||
			!endDate ||
			!monthlyRent ||
			!securityDeposit
		) {
			return json(
				{ message: 'All fields are required' },
				{ status: 400 }
			);
		}

		const requestRef = db.collection('rentalRequests').doc(requestId);
		const requestDoc = await requestRef.get();

		if (!requestDoc.exists) {
			return json(
				{ message: 'Rental request not found' },
				{ status: 404 }
			);
		}

		const rentalRequest = requestDoc.data();

		if (rentalRequest.ownerId !== locals.user.id) {
			return json(
				{ message: 'Not authorized' },
				{ status: 403 }
			);
		}

		if (rentalRequest.status !== 'Accepted') {
			return json(
				{ message: 'Rental request must be accepted first' },
				{ status: 400 }
			);
		}

		const leaseRef = db.collection('leases').doc();

		const lease = {
			propertyId: rentalRequest.propertyId,
			propertyTitle: rentalRequest.propertyTitle,

			ownerId: rentalRequest.ownerId,
			tenantId: rentalRequest.tenantId,

			requestId,

			startDate,
			endDate,

			monthlyRent: Number(monthlyRent),
			securityDeposit: Number(securityDeposit),

			status: 'Pending Acceptance',

			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString()
		};

		await leaseRef.set(lease);

		await db.collection('notifications').add({
			userId: rentalRequest.tenantId,
			title: 'Lease Generated',
			message: `Lease generated for "${rentalRequest.propertyTitle}"`,
			type: 'LEASE_GENERATED',
			isRead: false,
			createdAt: new Date().toISOString()
		});

		return json(
			{
				id: leaseRef.id,
				...lease
			},
			{
				status: 201
			}
		);
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