import React, { useState, useEffect } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { Asset } from 'expo-asset';
import { useNavigation } from '@react-navigation/native';

export default function SplashScreen() {
  const [logoOpacity] = useState(new Animated.Value(0));
  const [logoScale] = useState(new Animated.Value(0.8));
  const [mottoOpacity] = useState(new Animated.Value(0));
  const navigation = useNavigation();

  useEffect(() => {
    Animated.timing(logoOpacity, {
      toValue: 1,
      duration: 1500,
      useNativeDriver: true,
    }).start();

    Animated.timing(logoScale, {
      toValue: 1,
      duration: 1500,
      useNativeDriver: true,
    }).start();

    setTimeout(() => {
      Animated.timing(mottoOpacity, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }).start();
    }, 1500);

    const timeout = setTimeout(() => {
      navigation.replace('Login'); // Navigate after 3s
    }, 3000);

    return () => clearTimeout(timeout);
  }, []);

  const imageUri = Asset.fromModule(require('../images/trapmos.png')).uri;

  return (
    <View style={styles.container}>
      <Animated.Image
        source={{ uri: imageUri }}
        style={[
          styles.logo,
          {
            opacity: logoOpacity,
            transform: [{ scale: logoScale }],
          },
        ]}
        onError={(error) => console.error('Image load error:', error.nativeEvent)}
      />
      <Animated.Text
        style={[
          styles.motto,
          {
            opacity: mottoOpacity,
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
    width: 300,
    height: 300,
    resizeMode: 'contain',
  },
  motto: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
    marginHorizontal: 20,
    marginTop: 20,
  },
});
