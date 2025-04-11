import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Button,
  Alert,
  Image,
} from 'react-native';
import * as Location from 'expo-location';
import MapView, { Marker, Circle, Callout } from 'react-native-maps';
import { useNavigation } from '@react-navigation/native';
import { collection, getDocs } from 'firebase/firestore';
import { getDownloadURL, getStorage, ref } from 'firebase/storage';
import { db } from '../config/firebaseConfig';

export default function MapScreen() {
  const navigation = useNavigation();
  const [locations, setLocations] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [region, setRegion] = useState(null);
  const [loading, setLoading] = useState(true);

  const getDistanceKm = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(2);
  };

  const loadLocations = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location access is required.');
        return;
      }

      const currentLoc = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = currentLoc.coords;
      setUserLocation({ latitude, longitude });
      setRegion({
        latitude,
        longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });

      const uploadsRef = collection(db, 'Uploads');
      const querySnapshot = await getDocs(uploadsRef);
      const storage = getStorage();
      const fetchedLocations = [];

      for (const doc of querySnapshot.docs) {
        const data = doc.data();
        const { latitude, longitude, file, detections, device, timestamp } = data;
        if (!latitude || !longitude || !file) continue;

        const lat = parseFloat(latitude);
        const lng = parseFloat(longitude);

        let imageUrl = null;
        try {
          imageUrl = await getDownloadURL(ref(storage, `TRAPMOS_00000/${file}`));
        } catch (err) {
          console.warn(`Failed to load image for ${file}`);
        }

        const distance = getDistanceKm(
          latitude,
          longitude,
          currentLoc.coords.latitude,
          currentLoc.coords.longitude
        );

        fetchedLocations.push({
          id: doc.id,
          latitude: lat,
          longitude: lng,
          fileName: file,
          device: device || 'Unknown Device',
          timestamp: timestamp?.toDate?.() || null,
          imageUrl,
          distance,
        });
      }

      setLocations(fetchedLocations);
    } catch (err) {
      console.error('🔥 Error:', err);
      Alert.alert('Error', 'Could not load data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLocations();
  }, []);

  const getTimeAgo = (timestamp) => {
    if (!timestamp) return 'Unknown time';
    const now = new Date();
    const mins = Math.floor((now - timestamp) / 60000);
    const hrs = Math.floor(mins / 60);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins} min${mins !== 1 ? 's' : ''} ago`;
    return `${hrs} hour${hrs !== 1 ? 's' : ''} ago`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🛰️ Map Screen</Text>
      {region && !loading ? (
        <MapView
          style={styles.map}
          region={region}
          showsUserLocation
          showsMyLocationButton
          onRegionChangeComplete={setRegion}
        >
          {locations.map((loc, index) => (
            <React.Fragment key={index}>
              <Marker coordinate={{ latitude: loc.latitude, longitude: loc.longitude }}>
                <Callout tooltip>
                  <View style={styles.calloutBox}>
                    {loc.imageUrl && (
                      <Image source={{ uri: loc.imageUrl }} style={styles.image} />
                    )}
                    <Text style={styles.calloutTitle}>{loc.device}</Text>
                    <Text style={styles.calloutText}>🕒 {getTimeAgo(loc.timestamp)}</Text>
                    <Text style={styles.calloutText}>📄 {loc.fileName}</Text>
                    <Text style={styles.calloutText}>📏 {loc.distance} km from you</Text>
                  </View>
                </Callout>
              </Marker>
              <Circle
                center={{ latitude: loc.latitude, longitude: loc.longitude }}
                radius={250}
                strokeColor="rgba(255,0,0,0.7)"
                fillColor="rgba(255,0,0,0.2)"
              />
            </React.Fragment>
          ))}
        </MapView>
      ) : (
        <Text style={styles.text}>Loading location and pins...</Text>
      )}

      <View style={styles.buttonContainer}>
        <Button title="Go Back" onPress={() => navigation.goBack()} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f1924',
    padding: 20,
  },
  title: {
    fontSize: 22,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
  text: {
    fontSize: 16,
    color: '#ccc',
    textAlign: 'center',
    padding: 10,
  },
  map: {
    width: '100%',
    height: 320,
    marginBottom: 20,
  },
  buttonContainer: {
    marginTop: 20,
  },
  calloutBox: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 8,
    width: 220,
    alignItems: 'center',
    elevation: 5,
  },
  image: {
    width: 180,
    height: 100,
    borderRadius: 6,
    marginBottom: 6,
  },
  calloutTitle: {
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 2,
  },
  calloutText: {
    fontSize: 12,
    color: '#333',
  },
});
