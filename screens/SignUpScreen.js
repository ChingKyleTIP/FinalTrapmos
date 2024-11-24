import React, { useState } from "react";
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Image, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";
import { auth, db } from "../config/firebaseConfig";

const SignUpScreen = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigation = useNavigation();

  const handleSignUp = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    try {
      // Create user with Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Save user details in Firestore
      await setDoc(doc(db, "users", user.uid), {
        name,
        email,
      });

      Alert.alert("Success", "Sign Up Successful!");
      navigation.replace("Login"); // Redirect to Login screen
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.topSection}>
        <Image source={require("../images/trapmosLogin.png")} style={styles.logo} />
      </View>
      <View style={styles.formSection}>
        <TextInput
          style={styles.input}
          placeholder="Enter your name"
          value={name}
          onChangeText={setName}
          placeholderTextColor="#a9a9a9"
        />
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
        <TextInput
          style={styles.input}
          placeholder="Confirm your password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          placeholderTextColor="#a9a9a9"
        />
        <TouchableOpacity style={styles.signUpButton} onPress={handleSignUp}>
          <Text style={styles.signUpButtonText}>Sign Up</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("Login")}>
          <Text style={styles.loginLink}>Already have an account? Log In</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1b2a38",
  },
  topSection: {
    height: "25%",
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 150,
    height: 150,
    resizeMode: "contain",
  },
  formSection: {
    flex: 1,
    backgroundColor: "#1b2a38",
    alignItems: "center",
    paddingTop: 20,
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
  signUpButton: {
    backgroundColor: "#d3d3d3",
    borderRadius: 25,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    width: "80%",
    marginVertical: 15,
  },
  signUpButtonText: {
    color: "#1b2a38",
    fontWeight: "bold",
  },
  loginLink: {
    color: "#d3d3d3",
    textDecorationLine: "underline",
    marginTop: 15,
  },
});

export default SignUpScreen;
