import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import PostRentalScreen from '../components/PostRentalScreen';

export default function Index() {
  return <PostRentalScreen />;
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