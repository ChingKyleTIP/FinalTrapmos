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

  return (
    <View style={styles.container}>
      <Image
        source={require("../images/trapmosLogin.png")}
        style={styles.logo}
        resizeMode="contain"
      />

      <View style={styles.tabs}>
        <TouchableOpacity style={[styles.tab, styles.activeTab]}>
          <Text style={[styles.tabText, styles.activeTabText]}>Login</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tab}
          onPress={() => navigation.navigate("SignUp")}
        >
          <Text style={styles.tabText}>Sign up</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          placeholderTextColor="#A0B2A6"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholderTextColor="#A0B2A6"
        />
        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>Login</Text>
        </TouchableOpacity>
        <Text style={styles.bottomText}>
          Don't have account?{" "}
          <Text style={styles.linkText} onPress={() => navigation.navigate("SignUp")}>
            Sign up
          </Text>
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#002915",
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
    backgroundColor: "#f2f2f2",
    borderRadius: 5,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 5,
  },
  activeTab: {
    backgroundColor: "#B8C7B0",
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
    backgroundColor: "#03361e",
    borderRadius: 30,
    height: 50,
    width: "100%",
    paddingHorizontal: 20,
    color: "#fff",
    marginBottom: 15,
  },
  loginButton: {
    backgroundColor: "#d6d6d6",
    borderRadius: 25,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    marginBottom: 10,
  },
  loginButtonText: {
    color: "#333",
    fontWeight: "bold",
    fontSize: 16,
  },
  bottomText: {
    color: "#ccc",
  },
  linkText: {
    color: "#6bc9e0",
  },
});

export default LoginScreen;
