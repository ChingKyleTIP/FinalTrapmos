import React, { useState, useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TouchableOpacity, Text, Alert } from 'react-native';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { auth, db } from './config/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { registerForPushNotificationsAsync } from './PushNotif';

// Screens
import SplashScreen from './screens/SplashScreen';
import LoginScreen from './screens/LoginScreen';
import SignUpScreen from './screens/SignUpScreen';
import HomeScreen from './screens/HomeScreen';
import StatisticsScreen from './screens/StatisticsScreen';
import AlertsScreen from './screens/AlertsScreen';
import MapScreen from './screens/MapScreen';
import DataBaseScreen from './screens/DataBaseScreen';

const Stack = createNativeStackNavigator();

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export default function App() {
  const [user, setUser] = useState(null);
  const [expoPushToken, setExpoPushToken] = useState('');
  const [notification, setNotification] = useState(false);
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    // Register for push notifications
    registerForPushNotificationsAsync().then(token => {
      if (token) {
        setExpoPushToken(token.data);
      }
    });

    // Listen for incoming notifications
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    });

    // Listen for user interactions with notifications
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log(response);
    });

    // Clean up listeners
    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return unsubscribe;
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
