import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { TouchableOpacity, Text, Alert } from 'react-native';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { auth } from './config/firebaseConfig';

// 👉 PushNotif helper
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { getApp } from 'firebase/app';
const db = getFirestore(getApp());

// Screens
import SplashScreen from './screens/SplashScreen';
import LoginScreen from './screens/LoginScreen';
import SignUpScreen from './screens/SignUpScreen';
import HomeScreen from './screens/HomeScreen';
import StatisticsScreen from './screens/StatisticsScreen';
import AlertsScreen from './screens/AlertsScreen';
import MapScreen from './screens/MapScreen';
import DataBaseScreen from './screens/DataBaseScreen';

const Stack = createStackNavigator();

// Configure global notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function App() {
  useEffect(() => {
    const setupNotifications = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') return;

      const tokenData = await Notifications.getExpoPushTokenAsync();
      const token = tokenData.data;

      // ✅ Only save push token if NOT from Expo Go
      if (!Constants.expoConfig?.hostUri && !token.startsWith('ExponentPushToken')) {
        await addDoc(collection(db, 'PushTokens'), {
          token,
          timestamp: Date.now(),
        });
      }
    };

    setupNotifications();

    const sub = Notifications.addNotificationReceivedListener((n) => {
      const c = n.request.content;
      Alert.alert(c.title || 'Alert', c.body || '');
    });

    return () => sub.remove();
  }, []);

  const handleLogout = (nav) => {
    auth
      .signOut()
      .then(() => {
        Alert.alert('Logout', 'You have been logged out successfully!');
        nav.replace('Login');
      })
      .catch((e) => Alert.alert('Error', `Failed to log out: ${e.message}`));
  };

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Splash">
        <Stack.Screen name="Splash" component={SplashScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="SignUp" component={SignUpScreen} options={{ headerShown: false }} />
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={({ navigation }) => ({
            headerShown: true,
            headerTitle: 'Dashboard',
            headerStyle: { backgroundColor: '#0f1924' },
            headerTintColor: '#fff',
            headerRight: () => (
              <TouchableOpacity onPress={() => handleLogout(navigation)} style={{ marginRight: 15 }}>
                <Text style={{ color: '#fff', fontSize: 16 }}>Logout</Text>
              </TouchableOpacity>
            ),
          })}
        />
        <Stack.Screen name="Statistics" component={StatisticsScreen} options={headerOptions('Statistics')} />
        <Stack.Screen name="Alerts" component={AlertsScreen} options={headerOptions('Alerts')} />
        <Stack.Screen name="Map" component={MapScreen} options={headerOptions('Map')} />
        <Stack.Screen name="Database" component={DataBaseScreen} options={headerOptions('Database')} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const headerOptions = (title) => ({
  headerShown: true,
  headerTitle: title,
  headerStyle: { backgroundColor: '#0f1924' },
  headerTintColor: '#fff',
});
