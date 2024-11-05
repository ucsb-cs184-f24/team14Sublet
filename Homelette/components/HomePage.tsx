import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import MapView, { UrlTile } from 'react-native-maps';
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
  };

  return (
    <View style={styles.container}>
      <ThemedText style={styles.title}>Homelette Home Page</ThemedText>
      <ThemedText style={styles.userInfo}>User ID: {user.uid}</ThemedText>
      <ThemedText style={styles.userInfo}>Email: {user.email}</ThemedText>

      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 37.78825, 
          longitude: -122.4324, 
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        <UrlTile
          urlTemplate="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maximumZ={19}
          // subdomains={['a', 'b', 'c']}
        />
      </MapView>

      <TouchableOpacity style={styles.button} onPress={handleSignOut}>
        <ThemedText style={styles.buttonText}>Sign Out</ThemedText>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
    paddingHorizontal: 20,
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
  map: {
    width: '100%',
    height: 300,
    marginTop: 20,
  },
  button: {
    backgroundColor: '#4285F4',
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
    alignSelf: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
});
