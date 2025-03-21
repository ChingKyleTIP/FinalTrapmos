import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { TouchableOpacity, Text, Alert } from 'react-native';
import SplashScreen from './screens/SplashScreen';
import LoginScreen from './screens/LoginScreen';
import SignUpScreen from './screens/SignUpScreen';
import HomeScreen from './screens/HomeScreen'; // Ensure this is correctly imported
import StatisticsScreen from './screens/StatisticsScreen';
import AlertsScreen from './screens/AlertsScreen';
import MapScreen from './screens/MapScreen';
import DataBaseScreen from './screens/DataBaseScreen';
import UploadScreen from './screens/UploadScreen'; // Import UploadScreen here
import { auth } from './config/firebaseConfig';

const Stack = createStackNavigator();

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 3000);
    return () => clearTimeout(timer);
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
      <Stack.Navigator>
        {/* Always available screens */}
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="SignUp"
          component={SignUpScreen}
          options={{ headerShown: false }}
        />
        
        {/* Splash screen rendering condition */}
        {showSplash ? (
          <Stack.Screen
            name="Splash"
            component={SplashScreen}
            options={{ headerShown: false }}
          />
        ) : (
          <>
            <Stack.Screen
              name="Home"
              component={HomeScreen}  // Ensure this is in the stack
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
              component={UploadScreen}  // Add UploadScreen to the stack
              options={{
                headerShown: true,
                headerTitle: 'Upload Photo',
                headerStyle: { backgroundColor: '#0f1924' },
                headerTintColor: '#fff',
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
