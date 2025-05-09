import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { TouchableOpacity, Text, Alert } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { collection, addDoc } from 'firebase/firestore';
import SplashScreen from './screens/SplashScreen';
import LoginScreen from './screens/LoginScreen';
import SignUpScreen from './screens/SignUpScreen';
import HomeScreen from './screens/HomeScreen';
import StatisticsScreen from './screens/StatisticsScreen';
import AlertsScreen from './screens/AlertsScreen';
import MapScreen from './screens/MapScreen';
import DataBaseScreen from './screens/DataBaseScreen';
import UploadScreen from './screens/UploadScreen';
import { auth, db } from './config/firebaseConfig';

const Stack = createStackNavigator();

// Register and store Expo push token
const registerAndSaveToken = async () => {
  if (!Device.isDevice) {
    alert('Must use a physical device for push notifications');
    return;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    alert('Permission denied for notifications!');
    return;
  }

  const token = (await Notifications.getExpoPushTokenAsync()).data;
  console.log('📱 Expo Push Token:', token);

  // Optional: prevent duplicate token storage
  await addDoc(collection(db, 'PushTokens'), { token });
};

export default function App() {
  useEffect(() => {
    registerAndSaveToken();

    const subscription = Notifications.addNotificationReceivedListener(notification => {
      const content = notification.request.content;
      Alert.alert(content.title || 'Alert', content.body || 'Aedes detected!');
    });

    return () => subscription.remove();
  }, []);

  const handleLogout = (navigation) => {
    auth
      .signOut()
      .then(() => {
        Alert.alert('Logout', 'You have been logged out successfully!');
        navigation.replace('Login');
      })
      .catch((error) => {
        Alert.alert('Error', `Failed to log out: ${error.message}`);
      });
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
              <TouchableOpacity
                onPress={() => handleLogout(navigation)}
                style={{ marginRight: 15 }}
              >
                <Text style={{ color: '#fff', fontSize: 16 }}>Logout</Text>
              </TouchableOpacity>
            ),
          })}
        />
        <Stack.Screen
          name="Statistics"
          component={StatisticsScreen}
          options={{
            headerShown: true,
            headerTitle: 'Statistics',
            headerStyle: { backgroundColor: '#0f1924' },
            headerTintColor: '#fff',
          }}
        />
        <Stack.Screen
          name="Alerts"
          component={AlertsScreen}
          options={{
            headerShown: true,
            headerTitle: 'Alerts',
            headerStyle: { backgroundColor: '#0f1924' },
            headerTintColor: '#fff',
          }}
        />
        <Stack.Screen
          name="Map"
          component={MapScreen}
          options={{
            headerShown: true,
            headerTitle: 'Map',
            headerStyle: { backgroundColor: '#0f1924' },
            headerTintColor: '#fff',
          }}
        />
        <Stack.Screen
          name="Database"
          component={DataBaseScreen}
          options={{
            headerShown: true,
            headerTitle: 'Database',
            headerStyle: { backgroundColor: '#0f1924' },
            headerTintColor: '#fff',
          }}
        />
        <Stack.Screen
          name="UploadScreen"
          component={UploadScreen}
          options={{
            headerShown: true,
            headerTitle: 'Upload Photo',
            headerStyle: { backgroundColor: '#0f1924' },
            headerTintColor: '#fff',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
