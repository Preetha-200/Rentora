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

        const { requestId } = await request.json();

        if (!requestId) {
            return json(
                { message: 'Request ID is required' },
                { status: 400 }
            );
        }

        const requestRef = db.collection('rentalRequests').doc(requestId);
        const snapshot = await requestRef.get();

        if (!snapshot.exists) {
            return json(
                { message: 'Rental request not found' },
                { status: 404 }
            );
        }

        const rentalRequest = snapshot.data();

        if (rentalRequest.ownerId !== locals.user.id) {
            return json(
                { message: 'Not authorized' },
                { status: 403 }
            );
        }

        if (rentalRequest.status !== 'Pending') {
            return json(
                { message: 'Request has already been processed' },
                { status: 400 }
            );
        }

        const propertyRef = db.collection('properties').doc(rentalRequest.propertyId);
        const propertySnapshot = await propertyRef.get();

        if (!propertySnapshot.exists) {
            return json(
                { message: 'Associated property not found' },
                { status: 404 }
            );
        }

        const propertyData = propertySnapshot.data();
        const currentVacancy = Number(propertyData.vacancyCount) || 0;
        const currentTenants = Number(propertyData.tenantCount) || 0;

        if (currentVacancy <= 0) {
            return json(
                { message: 'No vacancies remaining for this property listing.' },
                { status: 400 }
            );
        }

        const newVacancyCount = currentVacancy - 1;
        const newTenantCount = currentTenants + 1;
        const newStatus = newVacancyCount === 0 ? 'Rented' : 'Available';
        const now = new Date().toISOString();

        const batch = db.batch();

        batch.update(requestRef, {
            status: 'Accepted',
            acceptedAt: now,
            updatedAt: now
        });

        batch.update(propertyRef, {
            vacancyCount: newVacancyCount,
            tenantCount: newTenantCount,
            status: newStatus,
            updatedAt: now
        });

        const notificationRef = db.collection('notifications').doc();
        batch.set(notificationRef, {
            userId: rentalRequest.tenantId,
            title: 'Rental Request Accepted',
            message: `Your request for "${rentalRequest.propertyTitle}" has been accepted.`,
            type: 'REQUEST_ACCEPTED',
            isRead: false,
            createdAt: now
        });

        await batch.commit();

        return json({
            message: 'Rental request accepted successfully'
        });
    } catch (error) {
        console.error(error);
        return json(
            { message: error.message },
            { status: 500 }
        );
    }
}