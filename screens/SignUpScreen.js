import React, { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Image,
  Alert,
} from "react-native";
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
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), { name, email });

      Alert.alert("Success", "Sign Up Successful!");
      navigation.replace("Login");
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require("../images/trapmosLogin.png")}
        style={styles.logo}
        resizeMode="contain"
      />

      <View style={styles.tabs}>
        <TouchableOpacity
          style={styles.tab}
          onPress={() => navigation.navigate("Login")}
        >
          <Text style={styles.tabText}>Login</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, styles.activeTab]}>
          <Text style={[styles.tabText, styles.activeTabText]}>Sign up</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Name"
          value={name}
          onChangeText={setName}
          placeholderTextColor="#a9a9a9"
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          placeholderTextColor="#a9a9a9"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholderTextColor="#a9a9a9"
        />
        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          placeholderTextColor="#a9a9a9"
        />
        <TouchableOpacity style={styles.signUpButton} onPress={handleSignUp}>
          <Text style={styles.signUpButtonText}>Sign up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#002a5c",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  logo: {
    width: 400,
    height: 80,
    marginBottom: 0,
  },
  tabs: {
    flexDirection: "row",
    width: "100%",
    marginBottom: 20,
    backgroundColor: "#e6e6e6",
    borderRadius: 5,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 5,
  },
  activeTab: {
    backgroundColor: "#a6c0e1",
  },
  tabText: {
    fontSize: 16,
    color: "#8a8a8a",
  },
  activeTabText: {
    color: "#000",
    fontWeight: "bold",
  },
  formContainer: {
    width: "100%",
    alignItems: "center",
  },
  input: {
    backgroundColor: "#064281",
    borderRadius: 30,
    height: 50,
    width: "100%",
    paddingHorizontal: 20,
    color: "#ffffff",
    marginBottom: 15,
  },
  signUpButton: {
    backgroundColor: "#d6d6d6",
    borderRadius: 25,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    marginBottom: 10,
  },
  signUpButtonText: {
    color: "#333",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default SignUpScreen;
