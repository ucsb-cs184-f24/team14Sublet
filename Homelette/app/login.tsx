import {Text, TextInput, View, StyleSheet, ScrollView, TouchableOpacity} from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "***",
  authDomain: "***",
  projectId: "***",
  storageBucket: "***",
  messagingSenderId: "***",
  appId: "***",
  measurementId: "***"
};

const app = initializeApp(firebaseConfig);

const AuthScreen = ({email, setEmail, password, setPassword, isLoggingIn, setIsLoggingIn, handleEmailAuthentication, handleGoogleButtonPress}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Sublet!</Text>

      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        autoCapitalize="none"
      />

        <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            secureTextEntry
        />

        <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={handleEmailAuthentication}>
            <Text style={styles.buttonText}>{isLoggingIn ? 'Sign In' : 'Sign Up'}</Text>
            </TouchableOpacity>
        </View>

        <View style={styles.bottomContainer}>
            <Text style={styles.toggleText} onPress={() => setIsLoggingIn(!isLoggingIn)}>
                {isLoggingIn ? 'Create an account' : 'Already have an account?'}
            </Text>
        </View>

        <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={handleGoogleButtonPress}>
                <Text style={styles.buttonText}>Using Google</Text>
            </TouchableOpacity>
        </View>
    </View>
  );
}

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(true);
  const [user, setUser] = useState(null);

  const router = useRouter();
  const auth = getAuth(app);
  const provider = new GoogleAuthProvider();

  const handleGoogleButtonPress = async () => {
    await signInWithPopup(auth, provider)
      .then((result) => {
        const user = result.user;
        setUser(user);
        console.log('Signed in with Google');
      })
      .catch((error) => {
          console.error(error.message);
      }
    );    
  }

  const handleEmailAuthentication = async () => {
    try {
      if(!user){
        if (isLoggingIn) { // Sign in
          await signInWithEmailAndPassword(auth, email, password);
          setUser(auth.currentUser);
          console.log('Signed in');
        }
        else { // Sign up
          await createUserWithEmailAndPassword(auth, email, password);
          setUser(auth.currentUser);
          console.log('Signed up');
        }
      }
    }
    catch (error) {
      console.error(error.message);
    }
  };

  useEffect(() => {
    if(user){
      signOut(auth);
    }
  }, [router]);

  useEffect(() => {
    if(user){
      router.push({
        pathname: '/tabs',
        params: { email }
      });
  }
  }, [user]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {!user ? (
        <AuthScreen
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        isLoggingIn={isLoggingIn}
        setIsLoggingIn={setIsLoggingIn}
        handleEmailAuthentication={handleEmailAuthentication}
        handleGoogleButtonPress={handleGoogleButtonPress}
      />
    ) : (
      <View style={styles.container}>
        <Text style={styles.title}>Loading</Text>
      </View>
  )}
  </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  authContainer: {
    width: '80%',
    maxWidth: 400,
    padding: 16,
    borderRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: 20,
    marginBottom: 24,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#3678da',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#fff',
    padding: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  input: {
    height: 40,
    width: 150,
    borderColor: '#ddd',
    borderWidth: 1,
    marginBottom: 24,
    padding: 8,
    borderRadius: 4,
  },
  buttonContainer: {
    marginTop: 8,
    marginBottom: 12,
  },
  bottomContainer: {
    marginTop: 20,
    marginBottom: 30,
  },
  toggleText: {
    color: '#3678da',
    textAlign: 'center',
    fontSize: 14,
  }
});