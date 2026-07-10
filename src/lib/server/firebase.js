import admin from "firebase-admin";

let credential;

if (process.env.FIREBASE_PROJECT_ID) {
	// Vercel / environment variables
	credential = admin.credential.cert({
		projectId: process.env.FIREBASE_PROJECT_ID,
		clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
		privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
	});
} else {
	// Local development
	const serviceAccount = (
		await import("../../../serviceAccountKey.json", {
			assert: { type: "json" },
		})
	).default;

	credential = admin.credential.cert(serviceAccount);
}

if (!admin.apps.length) {
	admin.initializeApp({
		credential,
		storageBucket:
			process.env.FIREBASE_STORAGE_BUCKET ||
			"rentalmanagement-15ed5.firebasestorage.app",
	});
}

const db = admin.firestore();
const auth = admin.auth();
const bucket = admin.storage().bucket();

export { admin, db, auth, bucket };