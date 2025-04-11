import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Alert, Text, ScrollView, TouchableOpacity } from 'react-native';
import MapView, { Marker, Circle } from 'react-native-maps';
import * as Location from 'expo-location';
import { collection, getDocs } from 'firebase/firestore';
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
  const [locations, setLocations] = useState([]);
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
    const fetchLocations = async () => {
      const snapshot = await getDocs(collection(db, 'Uploads'));
      const fetched = [];
      const unique = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        let { latitude, longitude, file, detections } = data;
        latitude = parseFloat(latitude);
        longitude = parseFloat(longitude);
        const isDetected = detections && detections.length > 0;

        const isDuplicate = unique.some(
          (loc) => getDistanceInKm(loc.latitude, loc.longitude, latitude, longitude) <= 0.25
        );

        if (!isNaN(latitude) && !isNaN(longitude) && !isDuplicate) {
          unique.push({ latitude, longitude });

          fetched.push({
            latitude,
            longitude,
            fileName: file,
            isDetected,
            distance: userLocation
              ? getDistanceInKm(userLocation.latitude, userLocation.longitude, latitude, longitude)
              : 0,
          });
        }
      });

      const sorted = fetched.sort((a, b) => a.distance - b.distance);
      setLocations(sorted);
    };

    if (userLocation) fetchLocations();
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
      {/* Persistent Location Card */}
      {userLocation && (
        <View style={styles.userLocationCard}>
          <Text style={styles.userLocationText}>📍 Your Location</Text>
          <Text style={styles.userLocationText}>
            Longitude: {userLocation.longitude.toFixed(7)}
          </Text>
          <Text style={styles.userLocationText}>
            Latitude:  {userLocation.latitude.toFixed(7)}
          </Text>
        </View>
      )}

      {userLocation && (
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={userLocation}
          showsUserLocation={true}
        >
          <Marker
            coordinate={userLocation}
            pinColor="blue"
            title={`You are here\nLongitude: ${userLocation.longitude.toFixed(7)}\nLatitude: ${userLocation.latitude.toFixed(7)}`}
          />

          {locations.map((loc, index) => (
            <React.Fragment key={index}>
              <Marker
                coordinate={{ latitude: loc.latitude, longitude: loc.longitude }}
                pinColor={loc.isDetected ? 'red' : 'green'}
                title={`${loc.fileName || 'Unknown'}\nLat: ${loc.latitude.toFixed(5)} | Lng: ${loc.longitude.toFixed(5)}`}
              />
              <Circle
                center={{ latitude: loc.latitude, longitude: loc.longitude }}
                radius={250}
                strokeColor={loc.isDetected ? 'rgba(255,0,0,0.6)' : 'rgba(0,255,0,0.6)'}
                fillColor={loc.isDetected ? 'rgba(255,0,0,0.2)' : 'rgba(0,255,0,0.2)'}
              />
            </React.Fragment>
          ))}
        </MapView>
      )}

      {/* Legend */}
      <View style={styles.legendOverlay}>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: 'red' }]} />
          <Text style={styles.legendText}>Aedes Detected</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: 'green' }]} />
          <Text style={styles.legendText}>No Detection</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: 'blue' }]} />
          <Text style={styles.legendText}>You</Text>
        </View>
      </View>

      {/* Location List with kilometers + meters */}
      <ScrollView style={styles.locationList}>
        <Text style={styles.listTitle}>Location List (sorted by proximity)</Text>
        {locations.map((loc, index) => {
          const kilometers = Math.floor(loc.distance);
          const meters = Math.round((loc.distance % 1) * 1000);
          return (
            <TouchableOpacity
              key={index}
              onPress={() => focusOnLocation(loc)}
              style={styles.locationBox}
            >
              <Text style={styles.locationText}>
                • {loc.fileName || 'Unknown'} — {kilometers} kilometers and {meters} meters away from you
                {'\n'}Longitude: {loc.longitude.toFixed(7)}
                {'\n'}Latitude:  {loc.latitude.toFixed(7)}
              </Text>
            </TouchableOpacity>
          );
        })}
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
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    zIndex: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
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
    marginBottom: 8,
    fontWeight: 'bold',
  },
  locationBox: {
    backgroundColor: '#1a2b3c',
    padding: 10,
    borderRadius: 10,
    marginBottom: 8,
  },
  locationText: {
    color: '#fff',
    fontSize: 14,
  },
});
