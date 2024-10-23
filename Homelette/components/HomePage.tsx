import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from './ThemedText';
import { signOut } from 'firebase/auth';
import { auth } from '@/config/firebase';

export function HomePage() {

    const handleSignOut = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error('Sign Out Error:', error);
        }
    }

  return (
    <View style={styles.container}>
      <ThemedText style={styles.title}>Homelette Home Page</ThemedText>
      <TouchableOpacity style={styles.button} onPress={handleSignOut}>
        <ThemedText style={styles.buttonText}>Sign Out</ThemedText>
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