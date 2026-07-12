import { json } from '@sveltejs/kit';
import { db, bucket } from '$lib/server/firebase';

const MAX_IMAGES = 6;

export async function GET({ params }) {
    try {
        const doc = await db.collection('properties').doc(params.id).get();

        if (!doc.exists) {
            return json(
                { message: 'Property not found' },
                { status: 404 }
            );
        }

        return json({
            id: doc.id,
            ...doc.data()
        });
    } catch (error) {
        console.error(error);
        return json(
            { message: 'Server error' },
            { status: 500 }
        );
    }
}

export async function PUT({ params, request, locals }) {
    try {
        if (!locals.user) {
            return json(
                { message: 'Authentication required' },
                { status: 401 }
            );
        }

        const docRef = db.collection('properties').doc(params.id);
        const snapshot = await docRef.get();

        if (!snapshot.exists) {
            return json(
                { message: 'Property not found' },
                { status: 404 }
            );
        }

        const property = snapshot.data();

        if (property.ownerId !== locals.user.id) {
            return json(
                { message: 'Not authorized' },
                { status: 403 }
            );
        }

        const data = await request.formData();

        // Separate remaining existing images vs fresh file uploads
        const remainingImages = data.getAll('existingImages').filter(Boolean);
        const files = data.getAll('images').filter((file) => file && file.name);

        if (remainingImages.length + files.length > MAX_IMAGES) {
            return json(
                { message: `Maximum ${MAX_IMAGES} images are allowed.` },
                { status: 400 }
            );
        }

        const updateData = {
            title: data.get('title'),
            description: data.get('description'),
            address: data.get('address'),
            city: data.get('city'),
            rent: Number(data.get('rent')),
            bedrooms: Number(data.get('bedrooms')),
            bathrooms: Number(data.get('bathrooms')),
            furnishing: data.get('furnishing'),
            amenities: data.get('amenities')?.split(',').map((a) => a.trim()).filter(Boolean) || [],
            updatedAt: new Date().toISOString()
        };

        let newUploadedUrls = [];
        if (files.length > 0) {
            for (const file of files) {
                const bytes = Buffer.from(await file.arrayBuffer());
                const fileName = `${params.id}_${Date.now()}_${file.name}`;
                const storageFile = bucket.file(`properties/${fileName}`);

                await storageFile.save(bytes, {
                    metadata: { contentType: file.type }
                });

                const [url] = await storageFile.getSignedUrl({
                    action: 'read',
                    expires: '01-01-2035'
                });

                newUploadedUrls.push(url);
            }
        }

        // Combine retained existing URLs with newly uploaded URLs
        updateData.images = [...remainingImages, ...newUploadedUrls];

        if (updateData.images.length === 0) {
            return json(
                { message: 'Please maintain or upload at least one property image.' },
                { status: 400 }
            );
        }

        // Requirement 3: Direct edit saves without resetting approval status to Pending
        await docRef.update(updateData);

        const updated = await docRef.get();

        return json({
            id: updated.id,
            ...updated.data()
        });
    } catch (error) {
        console.error(error);
        return json(
            { message: 'Server error' },
            { status: 500 }
        );
    }
}

export async function DELETE({ params, locals }) {
    try {
        if (!locals.user) {
            return json(
                { message: 'Authentication required' },
                { status: 401 }
            );
        }

        const docRef = db.collection('properties').doc(params.id);
        const snapshot = await docRef.get();

        if (!snapshot.exists) {
            return json(
                { message: 'Property not found' },
                { status: 404 }
            );
        }

        const property = snapshot.data();

        if (property.ownerId !== locals.user.id) {
            return json(
                { message: 'Not authorized' },
                { status: 403 }
            );
        }

        const now = new Date().toISOString();

        // Requirement 6: Dynamic Deletion Request Instead of Outright Direct Purging
        await docRef.update({
            deleteRequested: true,
            approvalStatus: 'Pending_Deletion' 
        });

        const approvalRef = db.collection('approvalRequests').doc();
        const admins = await db
            .collection('users')
            .where('role', '==', 'admin')
            .get();

        const batch = db.batch();

        batch.set(approvalRef, {
            propertyId: params.id,
            propertyTitle: property.title,
            ownerId: locals.user.id,
            ownerName: locals.user.name,
            ownerEmail: locals.user.email,
            status: 'Pending',
            requestType: 'DELETE',
            createdAt: now
        });

        admins.forEach((adminDoc) => {
            const notificationRef = db.collection('notifications').doc();
            batch.set(notificationRef, {
                userId: adminDoc.id,
                title: 'Property Deletion Request',
                message: `${locals.user.name} requested deletion of "${property.title}". Approval required.`,
                type: 'PROPERTY_DELETION',
                propertyId: params.id,
                read: false,
                createdAt: now
            });
        });

        await batch.commit();

        return json({
            message: 'Deletion request sent to admins successfully.'
        });
    } catch (error) {
        console.error(error);
        return json(
            { message: 'Server error' },
            { status: 500 }
        );
    }
}