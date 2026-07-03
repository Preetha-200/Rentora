// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD6G-hOyQu8vJJUEcGTsX-qtIuuDb5_VA8",
  authDomain: "rentalmanagement-15ed5.firebaseapp.com",
  projectId: "rentalmanagement-15ed5",
  storageBucket: "rentalmanagement-15ed5.firebasestorage.app",
  messagingSenderId: "885058800165",
  appId: "1:885058800165:web:2d9c15ac4d13e0612b0dcc",
  measurementId: "G-04NRKNK27Q"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);