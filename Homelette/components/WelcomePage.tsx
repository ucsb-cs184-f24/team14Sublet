import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { ThemedText } from './ThemedText';
import { signIn, signUp, signInWithGoogle } from '@/config/firebase';

export function WelcomePage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);

  const handleAuth = async () => {
    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        await signUp(email, password);
      }
      // Handle successful auth (navigation is handled in app/index.tsx)
    } catch (error) {
      console.error('Authentication Error:', error);
      // Handle auth error (e.g., show error message)
    }
  };

  const onGooglePress = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Google Auth Error:', error);
    }
  }

  return (
    <View style={styles.container}>
      <ThemedText style={styles.title}>Welcome to Homelette</ThemedText>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity style={styles.button} onPress={handleAuth}>
        <ThemedText style={styles.buttonText}>
          {isLogin ? 'Login' : 'Sign Up'}
        </ThemedText>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
        <ThemedText style={styles.switchText}>
          {isLogin ? 'Need an account? Sign Up' : 'Already have an account? Login'}
        </ThemedText>
      </TouchableOpacity>

      <TouchableOpacity onPress={ onGooglePress }>
        <ThemedText style={styles.switchText}>
          Sign in with Google
        </ThemedText>
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
  input: {
    width: '100%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  button: {
    backgroundColor: '#4285F4',
    padding: 10,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
  switchText: {
    marginTop: 15,
    color: '#4285F4',
  },
});
