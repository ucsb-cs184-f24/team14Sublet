// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, getDoc, collection, getDocs } from "firebase/firestore";
import { getStorage, ref, getDownloadURL } from "firebase/storage";
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
const storage = getStorage();

export const auth = getAuth(app);
export const firestore = getFirestore(app);

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

export async function getListings() {
  try {
    let result = [];
    let data = [];
    // Example code block modified from official Firebase docs
    const querySnapshot = await getDocs(collection(firestore, "listings"));
    querySnapshot.forEach((document) => {
      data.push(document.data());
    });

    let index = 0;
    for(document of data) {
      listing = document;
      let propertyRef = doc(firestore, "properties", listing['property_id']);
      console.log(listing['property_id'])
      let propertySnap = await (getDoc(propertyRef));
      let property = propertySnap.data()
        
      let imageRef = ref(storage, property['image_url']);
      let imageUrl = await getDownloadURL(imageRef);

      result.push({
        id: index,
        property: property['address']['street_address'],
        rent: listing['price'],
        startDate: listing['start_date'],
        endDate: listing['end_date'],
        image: imageUrl,
        bedCount: property['bedrooms'],
        bathCount: property['bathrooms'],
        area: property['area']
      });

      index++;
    }

    return result;
  } catch(error) {
    throw error;
  }
}

export async function getInterestedLeases() {
  try {
    uid = auth.currentUser?.uid;
    const docRef = doc(firestore, "users", uid);
    const docSnap = await getDoc(docRef);

    let result = []

    if (docSnap.exists()) {
      listings = docSnap.data()['interested_listing_ids'];
      console.log(listings);
      for (i in listings) {
        let listingRef = doc(firestore, "listings", listings[i]);
        let listingSnap = await (getDoc(listingRef));
        let listing = listingSnap.data();

        let propertyRef = doc(firestore, "properties", listing['property_id']);
        console.log(listing['property_id'])
        let propertySnap = await (getDoc(propertyRef));
        let property = propertySnap.data()
        
        let imageRef = ref(storage, property['image_url']);
        let imageUrl = await getDownloadURL(imageRef);

        result.push({
          id: i,
          property: property['address']['street_address'],
          rent: listing['price'],
          startDate: listing['start_date'],
          endDate: listing['end_date'],
          image: imageUrl,
          bedCount: property['bedrooms'],
          bathCount: property['bathrooms'],
          area: property['area']
        });
      }
    }
    else {
      console.log("NOT FOUND");
    }
    console.log(result);
    return result;
  } catch (error) {
    throw error;
  }
}
