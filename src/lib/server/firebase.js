import admin from 'firebase-admin';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

let credential;

if (process.env.FIREBASE_PROJECT_ID) {
	// Vercel
	credential = admin.credential.cert({
		projectId: process.env.FIREBASE_PROJECT_ID,
		clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
		privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
	});
} else {
	// Local development
	const serviceAccountPath = join(process.cwd(), 'serviceAccountKey.json');

	if (!existsSync(serviceAccountPath)) {
		throw new Error(
			'serviceAccountKey.json not found. Add it locally or configure Firebase environment variables.'
		);
	}

	const serviceAccount = JSON.parse(
		readFileSync(serviceAccountPath, 'utf8')
	);

	credential = admin.credential.cert(serviceAccount);
}

if (!admin.apps.length) {
	admin.initializeApp({
		credential,
		storageBucket:
			process.env.FIREBASE_STORAGE_BUCKET ||
			'rentalmanagement-15ed5.firebasestorage.app'
	});
}

const db = admin.firestore();
const auth = admin.auth();
const bucket = admin.storage().bucket();

export { admin, db, auth, bucket };