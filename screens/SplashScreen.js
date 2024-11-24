import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, Animated } from 'react-native';

export default function SplashScreen() {
  // Animated values for the logo and motto text
  const [logoOpacity] = useState(new Animated.Value(0)); // Logo starts with opacity 0
  const [mottoOpacity] = useState(new Animated.Value(0)); // Motto text starts with opacity 0
  const [logoScale] = useState(new Animated.Value(0.8)); // Initial scale for animation

  useEffect(() => {
    // Start logo animation: fade in and scale up
    Animated.timing(logoOpacity, {
      toValue: 1,
      duration: 1500, // 1.5 seconds duration
      useNativeDriver: true,
    }).start();

    // Scale up logo animation
    Animated.timing(logoScale, {
      toValue: 1,
      duration: 1500,
      useNativeDriver: true,
    }).start();

    // Fade in the motto text after a delay
    setTimeout(() => {
      Animated.timing(mottoOpacity, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }).start();
    }, 1500); // Delay by 1.5 seconds
  }, []);

  return (
    <View style={styles.container}>
      <Animated.Image
        source={require('../images/trapmos.png')} // Update the path to your image
        style={[
          styles.logo,
          {
            opacity: logoOpacity,
            transform: [{ scale: logoScale }],
          },
        ]}
      />
      <Animated.Text
        style={[
          styles.motto,
          {
            opacity: mottoOpacity, // Apply animated opacity to text
          },
        ]}
      >
        WE TRAP, WE MARK, AND WE DEFINE.
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 300, // Adjust size as needed
    height: 300, // Adjust size as needed
    resizeMode: 'contain',
  },
  motto: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000000', // Ensure this contrasts with your background color
    textAlign: 'center',
    marginHorizontal: 20,
    marginTop: 20,
  },
});
