import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { getDocs, collection } from 'firebase/firestore';
import { storage, db } from '../config/firebaseConfig';
import { ref, getDownloadURL } from 'firebase/storage';
import { useNavigation } from '@react-navigation/native';

export default function DataBaseScreen() {
  const [imageData, setImageData] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  const loadLatest10Images = async () => {
    try {
      setLoading(true);
      const uploadsRef = collection(db, 'Uploads');
      const querySnapshot = await getDocs(uploadsRef);

      const imagePromises = querySnapshot.docs.map(async (doc) => {
        const data = doc.data();
        const fileName = data.file;
        const { latitude, longitude, device, timestamp } = data;
        const fileRef = ref(storage, `TRAPMOS_00000/${fileName}`);

        try {
          const url = await getDownloadURL(fileRef);
          return {
            url,
            fileName,
            latitude,
            longitude,
            device,
            timestamp: timestamp?.toDate?.() || new Date(0),
          };
        } catch (error) {
          // 🔕 Don't throw alert, just log quietly
          console.log(`⚠️ Skipped missing image: ${fileName}`);
          return null;
        }
      });

      const results = await Promise.all(imagePromises);
      const filtered = results.filter((entry) => entry !== null);
      const latest10 = filtered
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 10);

      setImageData(latest10);
    } catch (error) {
      console.error('🔥 Error loading images from Firestore:', error);
      Alert.alert('Error', 'Could not load images from Firestore.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLatest10Images();
  }, []);

  const handlePress = (item) => {
    if (item.latitude && item.longitude) {
      navigation.navigate('Map', {
        latitude: item.latitude,
        longitude: item.longitude,
        device: item.device || '',
        file: item.fileName,
      });
    } else {
      Alert.alert('Location not available', 'This entry does not have location data.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Database Screen</Text>
      <Text style={styles.text}>Showing latest 10 images. Tap to view location.</Text>

      {loading ? (
        <Text style={styles.text}>Loading images...</Text>
      ) : imageData.length > 0 ? (
        imageData.map((item, idx) => (
          <TouchableOpacity
            key={idx}
            onPress={() => handlePress(item)}
            style={styles.imageContainer}
          >
            <Image source={{ uri: item.url }} style={styles.image} resizeMode="cover" />
            <Text style={styles.filename}>{item.fileName}</Text>
          </TouchableOpacity>
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
  imageContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  filename: {
    marginTop: 6,
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
  },
});
