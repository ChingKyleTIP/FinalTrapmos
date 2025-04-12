import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Alert, Text, ScrollView, TouchableOpacity } from 'react-native';
import MapView, { Marker, Circle } from 'react-native-maps';
import * as Location from 'expo-location';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';

const getDistanceInKm = (lat1, lon1, lat2, lon2) => {
  const toRad = (value) => (value * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export default function MapScreen() {
  const [userLocation, setUserLocation] = useState(null);
  const [detectedLocations, setDetectedLocations] = useState([]);
  const [noDetectedLocations, setNoDetectedLocations] = useState([]);
  const mapRef = useRef(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required.');
        return;
      }
      const current = await Location.getCurrentPositionAsync({});
      setUserLocation({
        latitude: current.coords.latitude,
        longitude: current.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    })();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!userLocation) return;

      const uploadsSnap = await getDocs(query(collection(db, 'Uploads'), orderBy('timestamp', 'desc'), limit(10)));
      const imagesSnap = await getDocs(query(collection(db, 'images'), orderBy('timestamp', 'desc'), limit(10)));

      const detected = [];
      const detectedCoords = new Set();

      uploadsSnap.forEach(doc => {
        const data = doc.data();
        const lat = parseFloat(data.latitude);
        const lng = parseFloat(data.longitude);
        if (!isNaN(lat) && !isNaN(lng)) {
          const distance = getDistanceInKm(userLocation.latitude, userLocation.longitude, lat, lng);
          detected.push({ latitude: lat, longitude: lng, fileName: data.file, distance });
          detectedCoords.add(`${lat.toFixed(7)}_${lng.toFixed(7)}`);
        }
      });

      const noDetected = [];

      imagesSnap.forEach(doc => {
        const data = doc.data();
        const lat = parseFloat(data.latitude);
        const lng = parseFloat(data.longitude);
        if (!isNaN(lat) && !isNaN(lng)) {
          const distance = getDistanceInKm(userLocation.latitude, userLocation.longitude, lat, lng);
          noDetected.push({
            latitude: lat,
            longitude: lng,
            fileName: data.file,
            distance,
            skipMarker: detectedCoords.has(`${lat.toFixed(7)}_${lng.toFixed(7)}`)
          });
        }
      });

      setDetectedLocations(detected);
      setNoDetectedLocations(noDetected);
    };

    fetchData();
  }, [userLocation]);

  const focusOnLocation = (loc) => {
    mapRef.current?.animateToRegion({
      latitude: loc.latitude,
      longitude: loc.longitude,
      latitudeDelta: 0.005,
      longitudeDelta: 0.005,
    }, 800);
  };

  return (
    <View style={styles.container}>
      {userLocation && (
        <View style={styles.userLocationCard}>
          <Text style={styles.userLocationText}>📍 Your Location</Text>
          <Text style={styles.userLocationText}>Longitude: {userLocation.longitude.toFixed(7)}</Text>
          <Text style={styles.userLocationText}>Latitude: {userLocation.latitude.toFixed(7)}</Text>
        </View>
      )}

      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={userLocation}
        showsUserLocation
      >
        {userLocation && (
          <Marker coordinate={userLocation} pinColor="blue" title="You are here" />
        )}

        {detectedLocations.map((loc, index) => (
          <React.Fragment key={`detected-${index}`}>
            <Marker
              coordinate={{ latitude: loc.latitude, longitude: loc.longitude }}
              pinColor="red"
              title={loc.fileName}
            />
            <Circle
              center={{ latitude: loc.latitude, longitude: loc.longitude }}
              radius={250}
              strokeColor="rgba(255,0,0,0.6)"
              fillColor="rgba(255,0,0,0.2)"
            />
          </React.Fragment>
        ))}

        {noDetectedLocations.map((loc, index) => {
          if (loc.skipMarker) return null;
          return (
            <React.Fragment key={`nodetected-${index}`}>
              <Marker
                coordinate={{ latitude: loc.latitude, longitude: loc.longitude }}
                pinColor="green"
                title={loc.fileName}
              />
              <Circle
                center={{ latitude: loc.latitude, longitude: loc.longitude }}
                radius={250}
                strokeColor="rgba(0,255,0,0.6)"
                fillColor="rgba(0,255,0,0.2)"
              />
            </React.Fragment>
          );
        })}
      </MapView>

      <View style={styles.legendOverlay}>
        <Text style={styles.legendText}>🔴 Aedes Detected</Text>
        <Text style={styles.legendText}>🟢 No Detection</Text>
        <Text style={styles.legendText}>🔵 You</Text>
      </View>

      <ScrollView style={styles.locationList}>
        <Text style={styles.listTitle}>🦟 Aedes Detected (Latest 10)</Text>
        {detectedLocations.map((loc, i) => (
          <TouchableOpacity key={i} onPress={() => focusOnLocation(loc)} style={styles.locationBox}>
            <Text style={styles.locationText}>
              {loc.fileName} — {Math.floor(loc.distance)} km & {Math.round((loc.distance % 1) * 1000)} m away{'\n'}
              Lat: {loc.latitude.toFixed(7)} | Lng: {loc.longitude.toFixed(7)}
            </Text>
          </TouchableOpacity>
        ))}

        <Text style={styles.listTitle}>🟩 No Detection (Latest 10)</Text>
        {noDetectedLocations.map((loc, i) => (
          <TouchableOpacity key={i} onPress={() => focusOnLocation(loc)} style={styles.locationBox}>
            <Text style={styles.locationText}>
              {loc.fileName} — {Math.floor(loc.distance)} km & {Math.round((loc.distance % 1) * 1000)} m away{'\n'}
              Lat: {loc.latitude.toFixed(7)} | Lng: {loc.longitude.toFixed(7)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f1924' },
  map: { flex: 1 },
  userLocationCard: {
    position: 'absolute',
    top: 40,
    left: 20,
    right: 20,
    zIndex: 999,
    backgroundColor: '#1a2b3c',
    padding: 12,
    borderRadius: 10,
    borderColor: '#4dd0e1',
    borderWidth: 1,
  },
  userLocationText: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 2,
  },
  legendOverlay: {
    position: 'absolute',
    bottom: 220,
    left: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 8,
    borderRadius: 8,
    zIndex: 10,
  },
  legendText: {
    color: '#fff',
    fontSize: 13,
  },
  locationList: {
    backgroundColor: '#0f1924',
    padding: 10,
    maxHeight: 200,
  },
  listTitle: {
    color: '#fff',
    fontSize: 16,
    marginTop: 10,
    marginBottom: 6,
    fontWeight: 'bold',
  },
  locationBox: {
    backgroundColor: '#1a2b3c',
    padding: 10,
    borderRadius: 10,
    marginBottom: 6,
  },
  locationText: {
    color: '#fff',
    fontSize: 13,
  },
});
