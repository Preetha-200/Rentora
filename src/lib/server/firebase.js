import admin from 'firebase-admin';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

const serviceAccountPath = join(process.cwd(), 'serviceAccountKey.json');

if (!existsSync(serviceAccountPath)) {
	throw new Error(
		'serviceAccountKey.json not found in the project root.\n' +
		'Download it from Firebase Console → Project Settings → Service Accounts.'
	);
}

const serviceAccount = JSON.parse(
	readFileSync(serviceAccountPath, 'utf8')
);

if (!admin.apps.length) {
	admin.initializeApp({
		credential: admin.credential.cert(serviceAccount),
		
		...(process.env.FIREBASE_STORAGE_BUCKET
			? {
					storageBucket: process.env.FIREBASE_STORAGE_BUCKET
			  }
			: {})
	});
}

const db = admin.firestore();
const auth = admin.auth();

let bucket = null;

if (process.env.FIREBASE_STORAGE_BUCKET) {
	bucket = admin.storage().bucket();
}

export { admin, db, auth, bucket };