import React, { useState } from "react";
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Image, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../config/firebaseConfig";

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigation = useNavigation();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      Alert.alert("Success", `Welcome back, ${userCredential.user.email}!`);
      navigation.replace("Home");
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  const handleNavigateToSignUp = () => {
    navigation.navigate("SignUp");
  };

  return (
    <View style={styles.container}>
      <Image source={require("../images/trapmosLogin.png")} style={styles.logo} />
      <TextInput
        style={styles.input}
        placeholder="Enter your email address"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        placeholderTextColor="#a9a9a9"
      />
      <TextInput
        style={styles.input}
        placeholder="Enter your password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholderTextColor="#a9a9a9"
      />
      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.loginButtonText}>Log In</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={handleNavigateToSignUp}>
        <Text style={styles.signUpLink}>Don't have an account? Sign Up</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1b2a38",
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  input: {
    backgroundColor: "#324a5e",
    borderRadius: 25,
    height: 50,
    width: "80%",
    paddingHorizontal: 15,
    color: "#fff",
    marginBottom: 15,
  },
  loginButton: {
    backgroundColor: "#d3d3d3",
    borderRadius: 25,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    width: "80%",
    marginVertical: 15,
  },
  loginButtonText: {
    color: "#1b2a38",
    fontWeight: "bold",
  },
  signUpLink: {
    color: "#d3d3d3",
    textDecorationLine: "underline",
  },
});

export default LoginScreen;
