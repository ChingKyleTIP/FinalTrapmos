import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MapView, { Marker, Circle } from 'react-native-maps';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebaseConfig'; // import Firestore config

export default function MapScreen() {
  const navigation = useNavigation();
  const [locations, setLocations] = useState([]); // State to store the locations
  const [loading, setLoading] = useState(true);
  const [region, setRegion] = useState({
    latitude: 14.1234, // Default center latitude
    longitude: 121.1234, // Default center longitude
    latitudeDelta: 0.0922, // Zoom level
    longitudeDelta: 0.0421, // Zoom level
  });

  // Function to load locations from Firestore
  const loadLocations = async () => {
    try {
      setLoading(true);
      const uploadsRef = collection(db, 'Uploads');
      const querySnapshot = await getDocs(uploadsRef);

      const fetchedLocations = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const { latitude, longitude, file } = data; // Extract latitude and longitude from Firestore

        if (latitude && longitude) {
          fetchedLocations.push({
            fileName: file,
            latitude,
            longitude,
          });
        }
      });

      setLocations(fetchedLocations); // Store the locations in state

      // Set the region based on the first location for better centering (optional)
      if (fetchedLocations.length > 0) {
        setRegion({
          latitude: fetchedLocations[0].latitude,
          longitude: fetchedLocations[0].longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
      }
    } catch (error) {
      console.error('🔥 Error loading locations: ', error);
      Alert.alert('Error', 'Could not load locations from Firestore.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLocations(); // Call the function when the screen mounts
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Map Screen</Text>
      <Text style={styles.text}>User locations will be displayed on the map.</Text>

      {loading ? (
        <Text style={styles.text}>Loading locations...</Text>
      ) : (
        <MapView
          style={styles.map}
          region={region} // Dynamic region for better control over map's center
          onRegionChangeComplete={(newRegion) => setRegion(newRegion)} // Allow region updates on drag/zoom
          showsUserLocation={true} // Optionally show user location
          followUserLocation={true} // Track user's location in real-time
          showsMyLocationButton={true} // Show the "My Location" button
        >
          {locations.map((location, index) => (
            <React.Fragment key={index}>
              {/* Marker for each location */}
              <Marker
                coordinate={{
                  latitude: location.latitude,
                  longitude: location.longitude,
                }}
                title={location.fileName} // Title for the marker (file name)
              />
              
              {/* Circle with a 250-meter radius around the marker */}
              <Circle
                center={{
                  latitude: location.latitude,
                  longitude: location.longitude,
                }}
                radius={250} // 250 meters radius
                strokeColor="rgba(0, 255, 0, 0.5)"
                fillColor="rgba(0, 255, 0, 0.2)"
              />
            </React.Fragment>
          ))}
        </MapView>
      )}

      <Button title="Go Back" onPress={() => navigation.goBack()} />
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
  map: {
    width: '100%',
    height: '70%', // Adjust the height of the map
    marginVertical: 10,
  },
});
