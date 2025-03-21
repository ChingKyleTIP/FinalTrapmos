import React, { useState, useEffect } from 'react';
import { View, Button, Image, Alert, Text, StyleSheet, TouchableOpacity } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage, ref, uploadBytes } from 'firebase/storage';

// Full Firebase Configuration (using the storage URL as a reference)
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
const storage = getStorage(app);  // Firebase Storage instance

const UploadScreen = () => {
  const [imageUri, setImageUri] = useState(null);

  // Request permissions for media library
  useEffect(() => {
    const requestPermissions = async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'We need access to your photos to upload an image.');
      }
    };

    requestPermissions();
  }, []);

  // Pick image from library
  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,  // Only images
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled) {
        console.log('Picked Image Result: ', result);  // Log the full result object
        setImageUri(result.assets[0].uri);  // Set the image URI to state
      } else {
        Alert.alert('Image selection canceled');
      }
    } catch (error) {
      console.error('Error picking image: ', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  // Upload image to Firebase Storage
  const uploadImage = async () => {
    if (!imageUri) {
      Alert.alert('No image selected', 'Please select an image first.');
      return;
    }

    try {
      const response = await fetch(imageUri);
      const blob = await response.blob();
      console.log('Fetched blob: ', blob);

      // Here we are using the full storage URL to create the storage reference
      const storageRef = ref(storage, 'gs://finaltrapmos.firebasestorage.app/Aedes/R.jpg');
      console.log('Storage ref created: ', storageRef);

      // Upload the blob to Firebase Storage
      await uploadBytes(storageRef, blob);

      Alert.alert('Success', 'Image uploaded successfully!');
    } catch (error) {
      console.error('Upload error: ', error);
      Alert.alert('Upload failed', 'There was an error uploading the image.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Upload an Image</Text>

      <TouchableOpacity onPress={pickImage} style={styles.button}>
        <Text style={styles.buttonText}>Pick an Image</Text>
      </TouchableOpacity>

      {/* Display the selected image */}
      {imageUri && (
        <View style={styles.imagePreview}>
          <Image source={{ uri: imageUri }} style={styles.image} />
        </View>
      )}

      <TouchableOpacity onPress={uploadImage} style={styles.uploadButton}>
        <Text style={styles.uploadButtonText}>Upload Image</Text>
      </TouchableOpacity>
    </View>
  );
};

// Styles for the components
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  imagePreview: {
    alignItems: 'center',
    marginBottom: 20,
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
  },
  uploadButton: {
    backgroundColor: '#28a745',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default UploadScreen;
