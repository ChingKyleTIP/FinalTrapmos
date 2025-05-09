import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import {
  MaterialIcons,
  Ionicons,
  Entypo,
  Feather,
} from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';

export default function HomeScreen() {
  const navigation = useNavigation();
  const [latestAlert, setLatestAlert] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchLatestAlert = async () => {
    try {
      setLoading(true);
      const snapshot = await getDocs(collection(db, 'Uploads'));

      const alerts = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((doc) => doc.timestamp?.toDate)
        .sort((a, b) => b.timestamp.toDate() - a.timestamp.toDate());

      if (alerts.length > 0) {
        setLatestAlert(alerts[0]);
      }
    } catch (error) {
      console.error('Error fetching latest alert:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLatestAlert();
  }, []);

  const formatTime = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return `${d.toLocaleDateString(undefined, {
      weekday: 'short',
    })}, ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Dashboard</Text>
      </View>

      <View style={styles.grid}>
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('Statistics')}
        >
          <MaterialIcons name="show-chart" size={30} color="#fff" />
          <Text style={styles.cardText}>Statistics</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('Alerts')}
        >
          <Ionicons name="notifications-outline" size={30} color="#fff" />
          <Text style={styles.cardText}>Alerts</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('Map')}
        >
          <Entypo name="map" size={30} color="#fff" />
          <Text style={styles.cardText}>Map</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('Database')}
        >
          <MaterialIcons name="storage" size={30} color="#fff" />
          <Text style={styles.cardText}>Database</Text>
        </TouchableOpacity>
      </View>

      {/* Recent Alert Section */}
      <View style={styles.recentHeader}>
        <Text style={styles.recentTitle}>Recent Alert</Text>
        <TouchableOpacity onPress={fetchLatestAlert}>
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Feather name="refresh-ccw" size={20} color="#fff" />
          )}
        </TouchableOpacity>
      </View>

      {latestAlert ? (
        <TouchableOpacity
          style={styles.alertCard}
          onPress={() =>
            navigation.navigate('Map', {
              latitude: latestAlert.latitude,
              longitude: latestAlert.longitude,
              device: latestAlert.device || '',
              file: latestAlert.file,
            })
          }
        >
          <Text style={styles.alertTitle}>
            {latestAlert.device || 'Unknown Location'}
          </Text>
          <Text style={styles.alertTime}>
            {formatTime(latestAlert.timestamp?.toDate())}
          </Text>
        </TouchableOpacity>
      ) : (
        <Text style={styles.noAlert}>No recent alert</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 30,
    backgroundColor: '#0f1924',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 35,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  card: {
    width: '48%',
    height: 120,
    backgroundColor: '#242424',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    padding: 10,
  },
  cardText: {
    color: '#ffffff',
    fontSize: 16,
    marginTop: 8,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  recentTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  alertCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  alertTime: {
    fontSize: 14,
    color: '#333',
    marginTop: 4,
  },
  noAlert: {
    color: '#aaa',
    fontSize: 14,
    textAlign: 'center',
  },
});
