import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, Alert, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MapView, { Marker, Circle } from 'react-native-maps';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { BarChart } from 'react-native-chart-kit';

export default function MapScreen() {
  const navigation = useNavigation();
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [region, setRegion] = useState({
    latitude: 14.1234,
    longitude: 121.1234,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  const [detectionCounts, setDetectionCounts] = useState({
    detected: 0,
    notDetected: 0,
  });

  const loadLocations = async () => {
    try {
      setLoading(true);
      const uploadsRef = collection(db, 'Uploads');
      const querySnapshot = await getDocs(uploadsRef);

      const fetchedLocations = [];
      let detectedCount = 0;
      let notDetectedCount = 0;

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        let { latitude, longitude, file, detections } = data;

        latitude = parseFloat(latitude);
        longitude = parseFloat(longitude);
        const isValid = !isNaN(latitude) && !isNaN(longitude);

        if (isValid) {
          const isDetected = detections && detections.length > 0;

          if (isDetected) {
            detectedCount++;
          } else {
            notDetectedCount++;
          }

          fetchedLocations.push({
            fileName: file,
            latitude,
            longitude,
            isDetected,
          });
        }
      });

      setDetectionCounts({
        detected: detectedCount,
        notDetected: notDetectedCount,
      });
      setLocations(fetchedLocations);

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
    loadLocations();
  }, []);

  const graphData = {
    labels: ['Detected', 'Not Detected'],
    datasets: [
      {
        data: [detectionCounts.detected, detectionCounts.notDetected],
        color: (opacity = 1) => `rgba(255, 0, 0, ${opacity})`,
        strokeWidth: 2,
      },
    ],
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Map Screen</Text>
      <Text style={styles.text}>User locations will be displayed on the map.</Text>

      {loading ? (
        <Text style={styles.text}>Loading locations...</Text>
      ) : (
        <MapView
          style={styles.map}
          region={region}
          onRegionChangeComplete={(newRegion) => setRegion(newRegion)}
          showsUserLocation={true}
          followUserLocation={true}
          showsMyLocationButton={true}
        >
          {locations.map((location, index) => (
            <React.Fragment key={index}>
              <Marker
                coordinate={{
                  latitude: location.latitude,
                  longitude: location.longitude,
                }}
                title={location.fileName}
              />
              <Circle
                center={{
                  latitude: location.latitude,
                  longitude: location.longitude,
                }}
                radius={250}
                strokeColor="rgba(255, 0, 0, 0.7)"
                fillColor="rgba(255, 0, 0, 0.3)"
              />
            </React.Fragment>
          ))}
        </MapView>
      )}

      <View style={styles.graphContainer}>
        <Text style={styles.graphTitle}>Aedes Mosquito Detection</Text>
        <BarChart
          style={styles.chart}
          data={graphData}
          width={Dimensions.get('window').width - 40}
          height={220}
          chartConfig={{
            backgroundColor: '#0f1924',
            backgroundGradientFrom: '#0f1924',
            backgroundGradientTo: '#0f1924',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            style: {
              borderRadius: 16,
            },
          }}
        />
      </View>

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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 20,
  },
  text: {
    fontSize: 16,
    color: '#a5a5a5',
    textAlign: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  map: {
    width: '100%',
    height: 300,
    marginBottom: 20,
  },
  graphContainer: {
    marginTop: 20,
    paddingHorizontal: 10,
  },
  graphTitle: {
    fontSize: 18,
    color: '#ffffff',
    marginBottom: 10,
  },
  chart: {
    marginTop: 10,
    marginBottom: 20,
  },
  buttonContainer: {
    marginTop: 20,
    width: '100%',
  },
});
