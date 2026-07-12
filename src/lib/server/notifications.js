/**
 * Centralizes the `db.collection('notifications').add({...})` /
 * `batch.set(notificationRef, {...})` pattern that was duplicated across
 * maintenance, payments, properties, and rental-requests endpoints.
 *
 * Pass a Firestore `batch` to enqueue the write as part of an existing
 * atomic batch (matches how property-approval and rental-requests already
 * bundle notification writes with their main update). Omit it to write
 * immediately as a standalone `add()`.
 *
 * @param {import('firebase-admin').firestore.Firestore} db
 * @param {{
 *   userId: string,
 *   title: string,
 *   message: string,
 *   type: string,
 *   propertyId?: string
 * }} notification
 * @param {import('firebase-admin').firestore.WriteBatch} [batch]
 */
export function createNotification(db, notification, batch) {
	const payload = {
		userId: notification.userId,
		title: notification.title,
		message: notification.message,
		type: notification.type,
		...(notification.propertyId && { propertyId: notification.propertyId }),
		read: false,
		createdAt: new Date().toISOString()
	};

	if (batch) {
		const ref = db.collection('notifications').doc();
		batch.set(ref, payload);
		return ref;
	}

	return db.collection('notifications').add(payload);
}
