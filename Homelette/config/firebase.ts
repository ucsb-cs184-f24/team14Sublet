// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, getDoc } from "firebase/firestore";
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


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

export async function getLeases() {
  try {
    uid = auth.currentUser?.uid;
    // console.log(uid);
    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);
    // console.log(docRef);

    let leases = []

    if (docSnap.exists()) {
      listings = docSnap.data()['interested_listing_ids'];
      console.log(listings);
      for (i in listings) {
        let listingRef = doc(db, "listings", listings[i]);
        let listingSnap = await (getDoc(listingRef));
        let listing = listingSnap.data();

        let propertyRef = doc(db, "properties", listing['property_id']);
        console.log(listing['property_id'])
        let propertySnap = await (getDoc(propertyRef));
        let property = propertySnap.data()
        

        leases.push({
          id: i,
          property: property['address']['street_address'],
          rent: listing['price'],
          startDate: listing['start_date'],
          endDate: listing['end_date'],
          image: property['image_url'],
          bedCount: property['bedrooms'],
          bathCount: property['bathrooms'],
          area: property['area']
        });
      }
    }
    else {
      console.log("NOT FOUND");
    }
    console.log(leases);
    return leases;
  } catch (error) {
    throw error;
  }
}
