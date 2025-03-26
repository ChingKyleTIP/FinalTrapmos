import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FontAwesome, MaterialIcons, Ionicons, Entypo } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function HomeScreen() {
  const navigation = useNavigation();

  const handleLogout = () => {
    navigation.replace('Login'); // Navigate back to the Login screen
    alert('You have been logged out!');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Dashboard</Text>
      </View>
      <View style={styles.grid}>
        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Statistics')}>
          <MaterialIcons name="show-chart" size={30} color="#fff" />
          <Text style={styles.cardText}>Statistics</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Alerts')}>
          <Ionicons name="notifications-outline" size={30} color="#fff" />
          <Text style={styles.cardText}>Alerts</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Map')}>
          <Entypo name="map" size={30} color="#fff" />
          <Text style={styles.cardText}>Map</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Database')}>
          <MaterialIcons name="storage" size={30} color="#fff" />
          <Text style={styles.cardText}>Database</Text>
        </TouchableOpacity>
        {/* Add the new Upload Screen button */}
        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('UploadScreen')}>
          <Ionicons name="cloud-upload-outline" size={30} color="#fff" />
          <Text style={styles.cardText}>Upload Photo</Text>
        </TouchableOpacity>
      </View>
      {/* Removed Logout Button */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#0f1924',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
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
  cardTextDark: {
    color: '#ffffff', // Match text color with other buttons
    fontSize: 16,
    marginTop: 8,
  },
});
