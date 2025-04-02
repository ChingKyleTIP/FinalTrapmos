import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Button, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';

export default function AlertsScreen() {
  const navigation = useNavigation();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const previousCount = useRef(0);

  const playAlertSound = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require('../assets/alert.mp3')
      );
      await sound.playAsync();
    } catch (e) {
      console.error('🔈 Error playing sound:', e);
    }
  };

  const fetchAllAlerts = async () => {
    try {
      const alertsRef = collection(db, 'Uploads');
      const snapshot = await getDocs(alertsRef);

      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      data.sort((a, b) =>
        b.timestamp?.toDate?.() - a.timestamp?.toDate?.()
      );

      if (previousCount.current && data.length > previousCount.current) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        playAlertSound();
      }

      previousCount.current = data.length;
      setAlerts(data);
    } catch (error) {
      console.error('🔥 Error loading alerts:', error);
      Alert.alert('Error', 'Could not load alerts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllAlerts();
    const interval = setInterval(fetchAllAlerts, 10000); // auto-refresh every 10s
    return () => clearInterval(interval);
  }, []);

  const getTimeSinceLastDetection = () => {
    if (alerts.length === 0) return { text: 'Unknown time ago', color: '#6c757d' };

    const latest = alerts[0]?.timestamp?.toDate?.();
    if (!latest) return { text: 'Unknown time ago', color: '#6c757d' };

    const now = new Date();
    const diffMs = now - latest;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHrs = Math.floor(diffMins / 60);

    let text = '';
    let color = '';

    if (diffMins < 1) {
      text = 'Just now';
      color = '#ff4444';
    } else if (diffMins < 60) {
      text = `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
      color = '#ff4444';
    } else if (diffHrs < 6) {
      text = `${diffHrs} hour${diffHrs > 1 ? 's' : ''} ago`;
      color = '#ffc107';
    } else {
      text = `${diffHrs} hour${diffHrs > 1 ? 's' : ''} ago`;
      color = '#6c757d';
    }

    return { text, color };
  };

  const renderItem = ({ item }) => {
    const detectionTime = item.timestamp?.toDate?.();
    const now = new Date();
    const diffMs = now - detectionTime;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHrs = Math.floor(diffMins / 60);

    let timeAgo = 'Just now';
    if (diffMins < 1) timeAgo = 'Just now';
    else if (diffMins < 60) timeAgo = `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    else timeAgo = `${diffHrs} hour${diffHrs > 1 ? 's' : ''} ago`;

    return (
      <TouchableOpacity
        style={styles.alertCard}
        onPress={() =>
          navigation.navigate('Map', {
            latitude: item.latitude,
            longitude: item.longitude,
            device: item.device,
            file: item.file,
          })
        }
      >
        <Text style={styles.location}>{item.device || 'Unknown Device'}</Text>
        <Text style={styles.filename}>📄 {item.file || 'No filename'}</Text>
        <Text style={styles.timestamp}>🕒 Detected {timeAgo}</Text>
        <Text style={styles.coords}>📍 Latitude: {item.latitude}</Text>
        <Text style={styles.coords}>📍 Longitude: {item.longitude}</Text>
      </TouchableOpacity>
    );
  };

  const { text: timeAgoText, color: tabColor } = getTimeSinceLastDetection();

  return (
    <View style={styles.container}>
      {/* ⚠️ Alert Warning Tab */}
      <View style={[styles.warningTab, { backgroundColor: tabColor }]}>
        <Text style={styles.warningText}>⚠ ALERT!</Text>
        <Text style={styles.warningText2}>Aedes Detected! — {timeAgoText}</Text>
      </View>

      <Text style={styles.title}>Recent Detections</Text>

      {loading ? (
        <Text style={styles.text}>Loading alerts...</Text>
      ) : alerts.length > 0 ? (
        <FlatList
          data={alerts}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      ) : (
        <Text style={styles.text}>No alerts found.</Text>
      )}

      <Button title="Go Back" onPress={() => navigation.goBack()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f1924',
    paddingTop: 10,
    paddingHorizontal: 20,
    paddingBottom: 50,
  },
  warningTab: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  warningText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 40,
    textAlign: 'center',
  },
  warningText2: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 22,
    textAlign: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 20,
    textAlign: 'left',
  },
  alertCard: {
    backgroundColor: '#1e1e1e',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  location: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  filename: {
    color: '#cccccc',
    fontSize: 14,
    marginTop: 4,
  },
  timestamp: {
    color: '#a5a5a5',
    fontSize: 13,
    marginTop: 4,
  },
  text: {
    color: '#a5a5a5',
    fontSize: 14,
    textAlign: 'center',
  },
  coords: {
    color: '#80dfff',
    fontSize: 13,
    marginTop: 2,
  },
});
