import React, { useState } from 'react';
import { View, Text, StyleSheet, Button, Image, Alert } from 'react-native';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAH43IdapLXl7g5MLxHTvgdQ2SWiD4Ia_8",
  authDomain: "finaltrapmos.firebaseapp.com",
  projectId: "finaltrapmos",
  storageBucket: "finaltrapmos.appspot.com",  // Correct bucket format
  messagingSenderId: "963883946464",
  appId: "1:963883946464:web:3a12d832bac04424799b85"
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);  // Initialize Firebase Storage instance

export default function DataBaseScreen() {
  const [imageUrl, setImageUrl] = useState(null); // State to store the image URL
  const [loading, setLoading] = useState(false); // State to manage loading state

  // Function to fetch image from Firebase Storage
  const fetchImage = async () => {
    setLoading(true); // Set loading state to true

    try {
      // Use the full gs:// URL format for Firebase Storage
      const imageRef = ref(storage, 'gs://finaltrapmos.firebasestorage.app/Aedes/R.jpg'); // Full gs:// URL
      console.log('Storage ref created: ', imageRef);

      // Get download URL for the image
      const url = await getDownloadURL(imageRef);
      console.log('Download URL:', url); // Log the download URL

      // Set the URL in state
      setImageUrl(url);
    } catch (error) {
      console.error('Error fetching image: ', error);
      Alert.alert('Error', 'Failed to load image');
    } finally {
      setLoading(false); // Stop loading after the image is fetched
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Database Screen</Text>
      <Text style={styles.text}>This is the Database screen where user details will be displayed.</Text>

      {/* Button to trigger fetching image */}
      <Button title="Load Data" onPress={fetchImage} />

      {/* Show a loading message if still fetching */}
      {loading ? (
        <Text style={styles.text}>Loading image...</Text>
      ) : (
        // Display the image if the URL is available
        imageUrl ? (
          <Image source={{ uri: imageUrl }} style={{ width: 300, height: 300 }} />
        ) : (
          <Text style={styles.text}>Image not found.</Text>
        )
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f1924',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 10,
  },
  text: {
    fontSize: 16,
    color: '#a5a5a5',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});
