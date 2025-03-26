import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, Alert } from 'react-native';
import { getDocs, collection } from 'firebase/firestore';
import { storage, db } from '../config/firebaseConfig'; // import Firestore and Storage
import { ref, getDownloadURL } from 'firebase/storage'; // import Storage

export default function DataBaseScreen() {
  const [imageUrls, setImageUrls] = useState([]);
  const [loading, setLoading] = useState(true);

  // Function to load all images from Firestore
  const loadAllImagesFromFirestore = async () => {
    try {
      setLoading(true);

      // Reference to the "Uploads" collection in Firestore
      const uploadsRef = collection(db, 'Uploads');
      const querySnapshot = await getDocs(uploadsRef);

      const fetchedUrls = [];

      // Loop through each document in the collection
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const fileName = data.file; // File name from Firestore

        console.log('📂 Retrieved file name:', fileName);

        // Create reference to the file in Firebase Storage
        const fileRef = ref(storage, `TRAPMOS_00000/${fileName}`);

        // Get download URL for each file
        getDownloadURL(fileRef)
          .then((url) => {
            console.log('🌐 Retrieved URL for file:', url);
            fetchedUrls.push(url); // Store URL in array
            if (fetchedUrls.length === querySnapshot.size) {
              // Once all URLs are fetched, update state
              setImageUrls(fetchedUrls);
            }
          })
          .catch((error) => {
            console.error('🔥 Error getting download URL for file: ', error);
          });
      });
    } catch (error) {
      console.error('🔥 Error loading images from Firestore: ', error);
      Alert.alert('Error', 'Could not load images from Firestore.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllImagesFromFirestore(); // Call the function when the component mounts
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Database Screen</Text>
      <Text style={styles.text}>Loading all JPGs from Firestore</Text>

      {loading ? (
        <Text style={styles.text}>Loading images...</Text>
      ) : imageUrls.length > 0 ? (
        imageUrls.map((url, idx) => (
          <Image
            key={idx}
            source={{ uri: url }}
            style={styles.image}
            resizeMode="contain"
          />
        ))
      ) : (
        <Text style={styles.text}>No images found.</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 20,
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
    marginBottom: 10,
  },
  image: {
    width: 300,
    height: 300,
    marginVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
  },
});
