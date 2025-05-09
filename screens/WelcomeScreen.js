import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Carousel from 'react-native-snap-carousel'; // Import the carousel
import { useNavigation } from '@react-navigation/native';

const WelcomeScreen = () => {
  const navigation = useNavigation();
  const [activeIndex, setActiveIndex] = useState(0);

  const slides = [
    {
      title: "Welcome to Our App",
      description: "Discover the best features and functionalities we offer.",
    },
    {
      title: "Stay Connected",
      description: "Stay up-to-date with our latest news and updates.",
    },
    {
      title: "Get Started Now",
      description: "Start exploring and experience the difference.",
    },
  ];

  const renderItem = ({ item }) => (
    <View style={styles.slide}>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.description}>{item.description}</Text>
      {activeIndex === slides.length - 1 && (
        <TouchableOpacity
          style={styles.getStartedButton}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.getStartedButtonText}>Get Started</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Carousel
        data={slides}
        renderItem={renderItem}
        sliderWidth={300}
        itemWidth={300}
        onSnapToItem={(index) => setActiveIndex(index)} // Track active slide
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1b2a38',
    justifyContent: 'center',
    alignItems: 'center',
  },
  slide: {
    width: '80%',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#a5a5a5',
    textAlign: 'center',
    marginBottom: 20,
  },
  getStartedButton: {
    backgroundColor: '#3ca25f',
    borderRadius: 25,
    height: 50,
    width: 200,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  getStartedButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default WelcomeScreen;
