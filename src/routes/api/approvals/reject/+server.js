import { json } from '@sveltejs/kit';
import { db } from '$lib/server/firebase';

export async function POST({ request, locals }) {
    try {
        if (!locals.user || locals.user.role !== 'admin') {
            return json(
                { message: 'Unauthorized. Admin access required.' },
                { status: 403 }
            );
        }

        const { propertyId, reason } = await request.json();

        if (!propertyId || !reason?.trim()) {
            return json(
                { message: 'Property ID and rejection reason are required' },
                { status: 400 }
            );
        }

        const propertyRef = db.collection('properties').doc(propertyId);
        const snapshot = await propertyRef.get();

        if (!snapshot.exists) {
            return json(
                { message: 'Property not found' },
                { status: 404 }
            );
        }

        const property = snapshot.data();
        const now = new Date().toISOString();
        const batch = db.batch();

        if (property.approvalStatus === 'Pending_Deletion' || property.deleteRequested) {
            // Rejecting a deletion request brings property status back online
            batch.update(propertyRef, {
                approvalStatus: 'Approved',
                deleteRequested: false,
                updatedAt: now
            });

            const appReqs = await db.collection('approvalRequests')
                .where('propertyId', '==', propertyId)
                .where('status', '==', 'Pending')
                .get();

            appReqs.forEach(doc => {
                batch.update(doc.ref, { status: 'Rejected', reason, resolvedAt: now });
            });

            const notificationRef = db.collection('notifications').doc();
            batch.set(notificationRef, {
                userId: property.ownerId,
                title: 'Property Deletion Rejected',
                message: `Deletion request for "${property.title}" was rejected. Reason: ${reason}`,
                type: 'DELETION_REJECTED',
                isRead: false,
                createdAt: now
            });

            await batch.commit();
            return json({ message: 'Property deletion rejected. Listing kept intact.' });
        }

        // Standard Creation Rejection Flow
        batch.update(propertyRef, {
            approvalStatus: 'Rejected',
            status: 'Rejected',
            approvalReason: reason,
            rejectedBy: locals.user.id,
            rejectedAt: now,
            updatedAt: now
        });

        const appReqs = await db.collection('approvalRequests')
            .where('propertyId', '==', propertyId)
            .where('status', '==', 'Pending')
            .get();

        appReqs.forEach(doc => {
            batch.update(doc.ref, { status: 'Rejected', reason, resolvedAt: now });
        });

        const notificationRef = db.collection('notifications').doc();
        batch.set(notificationRef, {
            userId: property.ownerId,
            title: 'Property Rejected',
            message: `"${property.title}" creation was rejected. Reason: ${reason}`,
            type: 'PROPERTY_REJECTED',
            isRead: false,
            createdAt: now
        });

        await batch.commit();

        return json({ message: 'Property rejected successfully' });
    } catch (error) {
        console.error(error);
        return json({ message: error.message }, { status: 500 });
    }
}