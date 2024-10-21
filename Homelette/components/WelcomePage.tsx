import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from './ThemedText';
import { signInWithGoogle } from '@/config/firebase'; // We'll create this function

export function WelcomePage() {
  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      // Handle successful sign-in (e.g., navigate to home screen)
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      // Handle sign-in error (e.g., show error message)
    }
  };

  return (
    <View style={styles.container}>
      <ThemedText style={styles.title}>Welcome to Homelette</ThemedText>
      <TouchableOpacity style={styles.button} onPress={handleGoogleSignIn}>
        <ThemedText style={styles.buttonText}>Sign in with Google</ThemedText>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#4285F4', // Google blue
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
});