import admin from 'firebase-admin';
import serviceAccount from '../../../serviceAccountKey.json' assert { type: 'json' };

if (!admin.apps.length) {
	admin.initializeApp({
		credential: admin.credential.cert(serviceAccount),
		storageBucket: serviceAccount.project_id + ".appspot.com"
	});
}

const db = admin.firestore();
const auth = admin.auth();
const bucket = admin.storage().bucket();

export { admin, db, auth, bucket };