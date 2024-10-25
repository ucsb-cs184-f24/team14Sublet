// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCJ_DV2YTIJm_oA-ITdy1I4kQAHRaB5fsk",
  authDomain: "team14-sublet-1034a.firebaseapp.com",
  projectId: "team14-sublet-1034a",
  storageBucket: "team14-sublet-1034a.appspot.com",
  messagingSenderId: "227281162992",
  appId: "1:227281162992:web:ad7bc4f3a19de5f557a835",
  measurementId: "G-NN10YB68DC"
};

GoogleSignin.configure({
  webClientId: '227281162992-b0svq5ia2qsc7qh7i3jugs56u9sd4f33.apps.googleusercontent.com',
});

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const signUp = async (email: string, password: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    throw error;
  }
};

export const signIn = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    throw error;
  }
};

export const signInWithGoogle = async () => {
  console.log('Google Pressed');
  try {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    const { idToken } = await GoogleSignin.signIn();
    const googleCredential = GoogleAuthProvider.credential(idToken);
    return signInWithCredential(auth, googleCredential);
  } catch (error) {
    throw error;
  }
};
