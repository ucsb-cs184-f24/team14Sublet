import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Text,
} from "react-native";
import { ThemedText } from "./ThemedText";
import { signIn, signUp } from "@/config/firebase";
import { WaveBackground } from './WaveBackground';

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
    <View style={styles.container}>
      <WaveBackground />
      <View style={styles.content}>
        <ThemedText style={styles.title}>Homelette</ThemedText>

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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
  },
  title: {
    fontSize: 38,
    fontWeight: "900",
    marginBottom: 40,
    marginTop: 20,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0.5, height: 0.5 },
    textShadowRadius: 1.5,
    letterSpacing: 1,
    padding: 15,
  },
  input: {
    width: "85%",
    height: 45,
    borderColor: "#E0E0E0",
    borderWidth: 1.5,
    borderRadius: 8,
    marginBottom: 25,
    paddingHorizontal: 15,
    backgroundColor: 'rgba(250, 250, 250, 0.9)',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#F3B33D',
    padding: 12,
    borderRadius: 8,
    width: "50%",
    alignItems: "center",
    marginTop: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    color: '#1B4571',
    fontSize: 18,
    fontWeight: "800",
  },
  switchText: {
    marginTop: 20,
    color: '#FFFFFF',
    fontSize: 15,
  },
  errorText: {
    color: '#FF6B6B',
    marginBottom: 12,
    textAlign: "center",
    fontSize: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 5,
    borderRadius: 4,
  },
});
