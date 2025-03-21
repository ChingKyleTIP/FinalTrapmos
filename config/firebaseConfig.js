import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAH43IdapLXl7g5MLxHTvgdQ2SWiD4Ia_8",
  authDomain: "finaltrapmos.firebaseapp.com",
  projectId: "finaltrapmos",
  storageBucket: "finaltrapmos.appspot.com",  // Correct bucket format, use 'finaltrapmos.appspot.com'
  messagingSenderId: "963883946464",
  appId: "1:963883946464:web:3a12d832bac04424799b85"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);  // Firebase Storage instance

export { auth, db, storage };
