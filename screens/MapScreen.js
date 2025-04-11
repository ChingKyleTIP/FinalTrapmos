import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView } from 'react-native';
import MapView, { Marker, Circle } from 'react-native-maps';
import { getDocs, collection } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import * as Location from 'expo-location';

export default function MapScreen() {
  const [userLocation, setUserLocation] = useState(null);
  const [locations, setLocations] = useState([]);
  const [region, setRegion] = useState(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('Location permission not granted');
        return;
      }
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      setUserLocation({ latitude, longitude });
      setRegion({
        latitude,
        longitude,
        latitudeDelta: 0.09,
        longitudeDelta: 0.04,
      });
    })();
  }, []);

  useEffect(() => {
    if (userLocation) {
      fetchLocations();
    }
  }, [userLocation]);

  const haversineDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;
    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
  };

  const fetchLocations = async () => {
    const snapshot = await getDocs(collection(db, 'Uploads'));
    const rawLocations = [];

    snapshot.forEach(doc => {
      const data = doc.data();
      if (!data.latitude || !data.longitude) return;

      const latitude = parseFloat(data.latitude);
      const longitude = parseFloat(data.longitude);
      const isDetected = data.detections && data.detections.length > 0;

      const distance = haversineDistance(
        userLocation.latitude,
        userLocation.longitude,
        latitude,
        longitude
      );

      rawLocations.push({
        latitude,
        longitude,
        isDetected,
        fileName: data.file,
        distance,
      });
    });

    // Remove overlapping markers within 250m
    const filtered = [];
    rawLocations.forEach(loc => {
      const isOverlapping = filtered.some(
        f =>
          haversineDistance(f.latitude, f.longitude, loc.latitude, loc.longitude) < 0.25
      );
      if (!isOverlapping) filtered.push(loc);
    });

    const sorted = filtered.sort((a, b) => a.distance - b.distance);
    setLocations(sorted);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📡 Map Screen</Text>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: 'red' }]} />
          <Text style={styles.legendText}>Aedes Detected</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: 'green' }]} />
          <Text style={styles.legendText}>No Detection</Text>
        </View>
      </View>

      {region && (
        <MapView
          style={styles.map}
          initialRegion={region}
          showsUserLocation
        >
          {locations.map((loc, index) => (
            <React.Fragment key={index}>
              <Marker
                coordinate={{ latitude: loc.latitude, longitude: loc.longitude }}
                title={loc.fileName}
                pinColor={loc.isDetected ? 'red' : 'green'}
              />
              <Circle
                center={{ latitude: loc.latitude, longitude: loc.longitude }}
                radius={250}
                strokeColor={loc.isDetected ? 'rgba(255,0,0,0.7)' : 'rgba(0,255,0,0.7)'}
                fillColor={loc.isDetected ? 'rgba(255,0,0,0.2)' : 'rgba(0,255,0,0.2)'}
              />
            </React.Fragment>
          ))}
        </MapView>
      )}

      <View style={styles.listContainer}>
        <Text style={styles.listTitle}>📍 Location List (sorted by proximity)</Text>
        <ScrollView style={{ maxHeight: 180 }}>
          {locations.map((loc, index) => (
            <Text key={index} style={styles.listItem}>
              • {loc.fileName} — {loc.distance.toFixed(2)} km
            </Text>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f1924', padding: 15 },
  title: { color: 'white', fontSize: 22, fontWeight: 'bold', marginBottom: 5, textAlign: 'center' },
  legend: { flexDirection: 'row', justifyContent: 'center', marginBottom: 10 },
  legendItem: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 10 },
  dot: { width: 12, height: 12, borderRadius: 6, marginRight: 5 },
  legendText: { color: '#fff' },
  map: { width: '100%', height: 400, marginBottom: 10 },
  listContainer: { marginTop: 10 },
  listTitle: { fontSize: 16, color: 'white', marginBottom: 5, fontWeight: 'bold' },
  listItem: { color: '#ddd', fontSize: 14, marginLeft: 5, marginBottom: 3 },
});
