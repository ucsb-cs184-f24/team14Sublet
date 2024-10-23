import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from './ThemedText';
import { signOut, User } from 'firebase/auth';
import { auth } from '@/config/firebase';

interface HomePageProps {
  user: User;
}

export function HomePage({ user }: HomePageProps) {
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
      <ThemedText style={styles.userInfo}>User ID: {user.uid}</ThemedText>
      <ThemedText style={styles.userInfo}>Name: {user.displayName || 'N/A'}</ThemedText>
      <ThemedText style={styles.userInfo}>Email: {user.email}</ThemedText>
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
  userInfo: {
    fontSize: 16,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#4285F4',
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
});
