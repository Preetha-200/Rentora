import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyD6G-hOyQu8vJJUEcGTsX-qtIuuDb5_VA8",
  authDomain: "rentalmanagement-15ed5.firebaseapp.com",
  projectId: "rentalmanagement-15ed5",
  storageBucket: "rentalmanagement-15ed5.firebasestorage.app",
  messagingSenderId: "885058800165",
  appId: "1:885058800165:web:2d9c15ac4d13e0612b0dcc",
  measurementId: "G-04NRKNK27Q",
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

let analytics = null;

isSupported().then((supported) => {
  if (supported) {
    analytics = getAnalytics(app);
  }
});

export { app, auth, db, storage, analytics };