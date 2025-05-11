// config/firebaseConfig.js
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { initializeAuth, getReactNativePersistence, getAuth } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: 'AIzaSyD9kADv0gULGOL8VCAHxPUe1kclSV4usqE',
  authDomain: 'finaltrapmos.firebaseapp.com',
  projectId: 'finaltrapmos',
  storageBucket: 'finaltrapmos.firebasestorage.app',
  messagingSenderId: '963883946464',
  appId: '1:963883946464:android:ce2563379538b327799b85'
};

// ✅ Safe initialization
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// ✅ Persistent auth setup
let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (e) {
  auth = getAuth(app); // fallback if already initialized
}

const db = getFirestore(app);
const storage = getStorage(app); // uses your correct bucket from config

export { app, auth, db, storage };
