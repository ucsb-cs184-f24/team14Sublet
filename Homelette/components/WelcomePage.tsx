import React, { useState } from "react";
import Svg, { Path } from "react-native-svg";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Text,
} from "react-native";
import { ThemedText } from "./ThemedText";
import { signIn, signUp } from "@/config/firebase";

export function WelcomePage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState("");

  const eduEmailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[eE][dD][uU]$/;

  const handleAuth = async () => {
    setError("");

    if (!eduEmailRegex.test(email)) {
      setError("Please enter a valid .edu email address.");
      return;
    }

    if (!isLogin) {
      if (!firstName.trim() || !lastName.trim()) {
        setError("Please enter your first and last names.");
        return;
      }
    }

    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        await signUp(email, password, firstName, lastName);
        // // Optionally, reset the first and last name fields after successful sign-up
        // setFirstName("");
        // setLastName("");
      }
    } catch (error) {
      console.error("Authentication Error:", error);
      setError(
        "Authentication failed. Please check your credentials and try again.",
      );
    }
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        backgroundColor: "transparent",
      }}
    >
      <View style={styles.yel}></View>
      <Svg
        height="80"
        width="100%"
        viewBox="0 0 1440 280"
        style={styles.waveTop}
      >
        <Path
          fill="#edc811"
          d="M0,192L80,176C160,160,320,128,480,144C640,160,800,224,960,229.3C1120,235,1280,181,1360,154.7L1440,128L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"
        />
      </Svg>
      <View style={styles.container}>
        <ThemedText style={styles.title}>Welcome to Homelette</ThemedText>

        {!isLogin && (
          <>
            <TextInput
              style={styles.input}
              placeholder="First Name"
              value={firstName}
              onChangeText={setFirstName}
              autoCapitalize="words"
              autoCorrect={false}
            />
            <TextInput
              style={styles.input}
              placeholder="Last Name"
              value={lastName}
              onChangeText={setLastName}
              autoCapitalize="words"
              autoCorrect={false}
            />
          </>
        )}

        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        <TouchableOpacity style={styles.button} onPress={handleAuth}>
          <ThemedText style={styles.buttonText}>
            {isLogin ? "Login" : "Sign Up"}
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
          <ThemedText style={styles.switchText}>
            {isLogin
              ? "Need an account? Sign Up"
              : "Already have an account? Login"}
          </ThemedText>
        </TouchableOpacity>
      </View>
      <Svg
        height="80"
        width="100%"
        viewBox="0 0 1440 280"
        style={styles.waveBottom}
      >
        <Path
          fill="#edc811"
          d="M0,192L80,176C160,160,320,128,480,144C640,160,800,224,960,229.3C1120,235,1280,181,1360,154.7L1440,128L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"
        />
      </Svg>
      <View style={styles.yel}></View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 100,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#000000",
  },
  input: {
    width: "100%",
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  button: {
    backgroundColor: "#4285F4",
    padding: 10,
    borderRadius: 5,
    width: "100%",
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
  },
  switchText: {
    marginTop: 15,
    color: "#4285F4",
  },
  errorText: {
    color: "red",
    marginBottom: 10,
    textAlign: "center",
  },
  yel: {
    width: "100%",
    flex: 1,
    backgroundColor: "#edc811",
  },
  whit: {
    width: "100%",
    flex: 1,
    paddingVertical: 30,
  },
  waveBottom: {
    bottom: 0,
  },
  waveTop: {
    top: 0,
    transform: [{ scaleX: -1 }, { scaleY: -1 }],
  },
});
