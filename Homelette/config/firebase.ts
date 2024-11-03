import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, getFirestore, setDoc, getDoc, collection, getDocs } from "firebase/firestore";
import { create } from "react-test-renderer";
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
  measurementId: "G-NN10YB68DC",
};

const app = initializeApp(firebaseConfig);
const storage = getStorage();
export const auth = getAuth(app);
export const firestore = getFirestore(app);

export const signUp = async (
  email: string,
  password: string,
  firstName: string,
  lastName: string,
) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );
    const user = userCredential.user;

    const userProfile = {
      email: email,
      first: firstName,
      last: lastName,
      interested_listing_ids: [],
      listing_ids: [],
      join_date: new Date(),
    };

    await setDoc(doc(firestore, "users", user.uid), userProfile);
  } catch (error) {
    throw error;
  }
};

export const signIn = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password,
    );
    return userCredential.user;
  } catch (error) {
    throw error;
  }
};

// async function fetchStorage(path: string) {
//   if(path == null) {
//     return undefined;
//   }

//   let dataRef = ref(storage, path);
//   let result = undefined;
//   try {
//     result = await getDownloadURL(dataRef);
//   }
//   catch(error) {
//     console.log(`Error fetching data from ${path}: ${error}`);
//     result = undefined;
//   }

//   return result;
// }

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

      // Skip empty listings
      if(listing == null || Object.entries(listing).length === 0) {
        continue;
      }

      let propertyRef = doc(firestore, "properties", listing['property_id']);
      console.log(listing['property_id'])
      let propertySnap = await (getDoc(propertyRef));
      let property = propertySnap.data()

      // Skip empty properties
      if(property == null || Object.entries(property).length === 0) {
        continue;
      }
      
      // let imageUrl = await fetchStorage(property['image_url']);
      let imageUrl = property['image_url'];
      let propertyAddress = "";
      if(typeof(property['address']) === 'object' && property['address']['street_address'] != null) {
        propertyAddress = property['address']['street_address'];
      }

      result.push({
        id: index,
        property: propertyAddress,
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

        // Skip empty listings
        if(listing == null || Object.entries(listing).length === 0) {
          continue;
        }

        let propertyRef = doc(firestore, "properties", listing['property_id']);
        console.log(listing['property_id'])
        let propertySnap = await (getDoc(propertyRef));
        let property = propertySnap.data()

        // Skip empty properties
        if(property == null || Object.entries(property).length === 0) {
          continue;
        }
        
        // let imageUrl = await fetchStorage(property['image_url']);
        let imageUrl = property['image_url'];
        if(typeof(property['address']) === 'object' && property['address']['street_address'] != null) {
          propertyAddress = property['address']['street_address'];
        }

        result.push({
          id: i,
          property: propertyAddress,
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
export const updateUserProfile = async (
  userId: string,
  updates: {
    first?: string;
    last?: string;
    phone?: number;
  }
) => {
  try {
    const userRef = doc(firestore, "users", userId);
    await updateDoc(userRef, updates);
  } catch (error) {
    throw error;
  }
};
