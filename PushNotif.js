import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Alert, Platform } from 'react-native';
import { collection, addDoc, query, where, getDocs, doc, setDoc } from 'firebase/firestore';
import { db } from './config/firebaseConfig'; // ✅ Adjust path if needed
import { getAuth } from 'firebase/auth';
import * as Application from 'expo-application';

/**
 * Call once on startup to register for notifications and
 * store the device's push token in Firestore (APK only).
 */
export async function registerForPushNotificationsAsync() {
  if (!Device.isDevice) {
    Alert.alert('Error', 'Must use a physical device for Push Notifications');
    return;
  }

  // Request permissions
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') {
    Alert.alert('Error', 'Failed to get push notification permissions!');
    return;
  }

  // Get the push token
  const token = await Notifications.getExpoPushTokenAsync({
    projectId: Constants.expoConfig.extra.eas.projectId,
  });

  // Save the token to Firestore
  if (token) {
    try {
      console.log('Saving token to Firestore...');
      
      // Use the push token as the document ID
      const tokenDocRef = doc(db, 'PushTokens', token.data);
      
      await setDoc(tokenDocRef, {
        token: token.data,
        updatedAt: new Date().toISOString(),
        platform: Platform.OS,
        appVersion: Application.nativeApplicationVersion || 'unknown',
        deviceType: Device.deviceType || 'unknown'
      }, { merge: true });

      console.log('Token saved successfully');
      Alert.alert('Success', 'Push notification token saved successfully');
    } catch (error) {
      console.error('Error saving token:', error);
      Alert.alert('Error', `Failed to save push token: ${error.message}`);
    }
  }

  return token;
}

/** Global handler so notifications show alert & sound */
export function configureNotificationHandler() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
}
