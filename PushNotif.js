import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Alert } from 'react-native';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from './config/firebaseConfig'; // ✅ Adjust path if needed

/**
 * Call once on startup to register for notifications and
 * store the device’s push token in Firestore (APK only).
 */
export async function registerForPushNotificationsAsync() {
  if (!Device.isDevice) {
    Alert.alert('Error', 'Must use a physical device for Push Notifications');
    return;
  }

  // Ask notification permission
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    Alert.alert('Permission Required', 'Notification permission not granted');
    return;
  }

  try {
    const token = (await Notifications.getExpoPushTokenAsync()).data;

    // ✅ Skip Expo Go tokens and web builds
    if (
      token.startsWith('ExponentPushToken') ||
      Constants.expoConfig?.hostUri // indicates Expo Go usage
    ) {
      console.log('🛑 Expo Go or development token — skipping:', token);
      return;
    }

    console.log('✅ APK Push Token:', token);

    // Avoid duplicates
    const q = query(collection(db, 'PushTokens'), where('token', '==', token));
    const snap = await getDocs(q);
    if (!snap.empty) {
      console.log('ℹ️ Token already stored in Firestore');
      return;
    }

    await addDoc(collection(db, 'PushTokens'), { token, timestamp: Date.now() });
    console.log('📥 Token saved to Firestore');
  } catch (error) {
    console.error('🔥 Failed to save push token:', error);
    Alert.alert('Save token failed', error.message);
  }
}

/** Global handler so notifications show alert & sound */
export function configureNotificationHandler() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}
