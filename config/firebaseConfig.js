// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAH43IdapLXl7g5MLxHTvgdQ2SWiD4Ia_8",
  authDomain: "finaltrapmos.firebaseapp.com",
  projectId: "finaltrapmos",
  storageBucket: "finaltrapmos.firebasestorage.app",
  messagingSenderId: "963883946464",
  appId: "1:963883946464:web:1a3008bf263be06f799b85"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and Firestore
export const auth = getAuth(app); // Export the authentication instance
export const db = getFirestore(app); // Export the Firestore database instance
