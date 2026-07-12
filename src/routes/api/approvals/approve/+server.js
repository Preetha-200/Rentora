import { json } from '@sveltejs/kit';
import { db, bucket } from '$lib/server/firebase';

export async function POST({ request, locals }) {
    try {
        if (!locals.user || locals.user.role !== 'admin') {
            return json(
                { message: 'Unauthorized. Admin access required.' },
                { status: 403 }
            );
        }

        const { propertyId } = await request.json();

        if (!propertyId) {
            return json(
                { message: 'Property ID is required' },
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

        // Check if handling a deletion approval or a creation approval
        if (property.approvalStatus === 'Pending_Deletion' || property.deleteRequested) {
            // Requirements 6: Clean up files from storage bucket upon deletion confirmation
            if (property.images) {
                for (const imageUrl of property.images) {
                    try {
                        const fileName = imageUrl.split('/').pop().split('?')[0];
                        batch.delete(bucket.file(`properties/${fileName}`));
                    } catch {}
                }
            }

            // Remove property record permanently
            batch.delete(propertyRef);

            // Update matching outstanding tracking approval requests
            const appReqs = await db.collection('approvalRequests')
                .where('propertyId', '==', propertyId)
                .where('status', '==', 'Pending')
                .get();

            appReqs.forEach(doc => {
                batch.update(doc.ref, { status: 'Approved', resolvedAt: now });
            });

            // Notify owner
            const notificationRef = db.collection('notifications').doc();
            batch.set(notificationRef, {
                userId: property.ownerId,
                title: 'Property Deletion Approved',
                message: `"${property.title}" deletion request has been approved and removed.`,
                type: 'PROPERTY_DELETED',
                isRead: false,
                createdAt: now
            });

            await batch.commit();

            return json({ message: 'Property deletion approved and purged successfully' });
        }

        // Standard validation check for basic creation approval rules
        if (property.approvalStatus === 'Approved') {
            return json({ message: 'Property is already approved' });
        }

        // Requirement 2 & 7: Update approvalStatus and status fields identically to make visible
        batch.update(propertyRef, {
            approvalStatus: 'Approved',
            status: 'Available', 
            approvalReason: '',
            approvedBy: locals.user.id,
            approvedAt: now,
            updatedAt: now
        });

        const appReqs = await db.collection('approvalRequests')
            .where('propertyId', '==', propertyId)
            .where('status', '==', 'Pending')
            .get();

        appReqs.forEach(doc => {
            batch.update(doc.ref, { status: 'Approved', resolvedAt: now });
        });

        const notificationRef = db.collection('notifications').doc();
        batch.set(notificationRef, {
            userId: property.ownerId,
            title: 'Property Approved',
            message: `"${property.title}" has been approved and is now live.`,
            type: 'PROPERTY_APPROVED',
            isRead: false,
            createdAt: now
        });

        await batch.commit();

        return json({ message: 'Property approved successfully' });
    } catch (error) {
        console.error(error);
        return json({ message: error.message }, { status: 500 });
    }
}