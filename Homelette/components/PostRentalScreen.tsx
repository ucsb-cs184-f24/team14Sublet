import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Image, TouchableOpacity, Pressable, Platform, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { addDoc, collection, doc, arrayUnion, arrayRemove, updateDoc } from 'firebase/firestore';
import {auth, firestore, storage} from '@/config/firebase';
import {ref, uploadBytes, getDownloadURL} from 'firebase/storage';

export default function PostRentalScreen() {
  const [address, setAddress] = useState('');
  const [aptNumber, setAptNumber] = useState('');
  const [area, setArea] = useState('');
  const [bathCount, setBathCount] = useState('');
  const [bedCount, setBedCount] = useState('');
  const [price, setPrice] = useState('');
  const [type, setType] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [image, setImage] = useState('');

  const [date, setDate] = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
    
  const handleSubmit = async () => {
    try {
      if (!address || !bathCount || !bedCount || !price || !description || !area || !startDate || !endDate) {
        alert('Please fill in all the required fields.');
        return;
      }

      // wait for image data to be saved to firebase
      const newImageUri = await saveImageToFirebase();
      console.log("ImageUri from Firebase: ", newImageUri);

      await addPropertyAndListing(newImageUri);

      } catch (error) {
        console.error("Error adding documents: ", error);
    }
  };

  const addPropertyAndListing = async (newImageUri) => {
    try {
      const propertyData = {
        address: address, // this needs to be changed later
        area: area,
        bathrooms: bathCount,
        bedrooms: bedCount,
        image_url: newImageUri,
        owner_id: auth.currentUser?.uid,
        type: type
      };
      const listingData = {
        author_id: auth.currentUser?.uid,
        end_date: "end",
        end_date_TEST: endDate,
        interested_users_ids: [],
  
        price: price,
        start_date: "start",
        start_date_TEST: startDate,
      };
      // first property data
      const propertyRef = await addDoc(collection(firestore, "properties"), {
        ...propertyData
      });
      // get the generated id
      const propertyId = propertyRef.id;

      // now listing document
      const newListing = {
        ...listingData,
        property_id: propertyId
      };

      await addDoc(collection(firestore,"listings"), newListing);

      const userRef = doc(firestore, "users", auth.currentUser?.uid);
      await updateDoc(userRef, {
        listing_ids: arrayUnion(propertyId),
      });

      Alert.alert(
        "Success",
        "Your property is submitted",
        [{ text: "OK", onPress: () => console.log("OK Pressed") }] 
      );


      console.log("Property and listing added; user's listing_ids updated");
    } catch (error) {
      console.error("Error adding documents: ", error);
      Alert.alert(
        "Error",
        "There was an error submitting your property. Please try again.",
        [{ text: "OK", onPress: () => console.log("OK Pressed") }]
      );
    }
  }
  

  const toggleDatePicker = (key) => {
    if (key === 'start') {
        setShowStartPicker(!showStartPicker);
    } else if (key === 'end') {
        setShowEndPicker(!showEndPicker);
    }
  };


  const onChangeDatePicker = (key, event, selectedDate) => {
    const currentDate = selectedDate || date;
    setDate(currentDate);
    if (Platform.OS === 'android') {
        toggleDatePicker(key);
        if (key === 'start') {
            setStartDate(formatDate(currentDate));
        } else {
            setEndDate(formatDate(currentDate));
        }
    }
  };

  const formatDate = (rawDate) => {
    const date = new Date(rawDate);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();

    return `${month}-${day}-${year}`;
  };

  const confirmIOSDate = (key) => {
    if (key === 'start') {
        setStartDate(formatDate(date));
    } else {
        setEndDate(formatDate(date));
    }
    toggleDatePicker(key);
  };


  const handleImageUpload = async() => {
    try {
      await ImagePicker.requestCameraPermissionsAsync();
      let result = await ImagePicker.launchCameraAsync({
        cameraType: ImagePicker.CameraType.Front,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.5,
      });
      if (!result.cancelled) {
        imageUri = result.assets[0].uri;
        await saveImage(imageUri);
        return;
      }
    }
    catch (error) {
      console.log(error);
    }
  };

  const handleImageSelect = async() => {
    try{
      await ImagePicker.requestMediaLibraryPermissionsAsync();
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.5,
      });
      if (!result.cancelled) {
        imageUri = result.assets[0].uri;
        await saveImage(imageUri);
        return;
      }
    }
    catch (error) {
      console.log(error);
    }
  };

  const saveImage = async (image: any) => {
    try{
      setImage(image);
    }
    catch (error) {
      console.log(error);
    }
  };

  // need to test, but can start with this stuff maybe
  const saveImageToFirebase = async () => {
      try {
          // Convert URI to Blob
          const response = await fetch(image);
          const blob = await response.blob();

          // Create a storage reference
          const storageRef = ref(storage, `images/${Date.now()}.jpg`);

          // Upload the blob to Firebase Storage
          await uploadBytes(storageRef, blob);

          // Get the download URL and set it to the state
          const downloadURL = await getDownloadURL(storageRef);
          return downloadURL;
      } catch (error) {
          console.error("Error uploading image: ", error);
      }
  };


  return (
    <View style={styles.container}>
        <Text style={styles.header}>Post Your Lease</Text>

        <View style={{ flexDirection : 'row'}}>
        <TouchableOpacity style={styles.imageButton}>
          <Image source={image ? {uri: image} : require('../assets/images/placeholder.png')} style={styles.image} />
          <TouchableOpacity style={styles.editButton} onPress={handleImageSelect}>
            <MaterialCommunityIcons name="view-gallery-outline" size={24} color="black" />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.editButton, {bottom: 40,}]} onPress={handleImageUpload}>
              <MaterialCommunityIcons name="camera-outline" size={24} color="black" />
          </TouchableOpacity>
        </TouchableOpacity>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Address"
          value={address}
          onChangeText={setAddress}
        />

        <View style={{ flexDirection : 'row', justifyContent: 'space-between' }}>
            <TextInput
                style={[styles.input, styles.subinput]}
                placeholder="Apt"
                value={aptNumber}
                onChangeText={setAptNumber}
            />
            <TextInput
                style={[styles.input, styles.subinput]}
                placeholder="Area"
                value={area}
                onChangeText={setArea}
            />
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <TextInput
                style={[styles.input, styles.subinput]}
                placeholder="Bedrooms"
                keyboardType="numeric"
                value={bedCount}
                onChangeText={setBedCount}
            />
            <TextInput
                style={[styles.input, styles.subinput]}
                placeholder="Bathrooms"
                keyboardType="numeric"
                value={bathCount}
                onChangeText={setBathCount}
            />
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <TextInput
            style={[styles.input, styles.subinput]}
            placeholder="Price per Month ($)"
            keyboardType="numeric"
            value={price}
            onChangeText={setPrice}
          />
          <TextInput
            style={[styles.input, styles.subinput]}
            placeholder="Type"
            value={type}
            onChangeText={setType}
          />
        </View>


        <View>  
          { showStartPicker && (
            <DateTimePicker
              mode='date'
              display='spinner'
              value={date}
              onChange={(event, selectedDate) => onChangeDatePicker('start', event, selectedDate)}
              style={styles.datePicker}
              minimumDate={new Date('2024-9-1')}
            />
          )}

          { showStartPicker && Platform.OS === 'ios' && (
            <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                        <TouchableOpacity onPress={() => toggleDatePicker('start')} style={styles.pickerButton}>
                <Text>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => confirmIOSDate('start')} style={styles.pickerButton}>
                <Text>Confirm</Text>
              </TouchableOpacity>
            </View>
          )}

          { !showStartPicker && (
              <Pressable onPress={() => toggleDatePicker('start')}>
                <TextInput
                  style={styles.input}
                  placeholder="Start Date"
                  value={startDate}
                  onChangeText={setStartDate}
                  editable={false} 
                  onPressIn={() => toggleDatePicker('start')}
                />
              </Pressable>
            )
          }
        </View>

        <View>
          { showEndPicker && (
            <DateTimePicker
              mode='date'
              display='spinner'
              value={date}  
              onChange={(event, selectedDate) => onChangeDatePicker('end', event, selectedDate)}  
              style={styles.datePicker}
              minimumDate={new Date('2024-9-1')}
            />
          )}

          { showEndPicker && Platform.OS === 'ios' && (
            <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
              <TouchableOpacity onPress={() => toggleDatePicker('end')} style={styles.pickerButton}>
                <Text>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => confirmIOSDate('end')} style={styles.pickerButton}>
                <Text>Confirm</Text>
              </TouchableOpacity>
            </View>
          )}

          { !showEndPicker && (
              <Pressable onPress={() => toggleDatePicker('end')}>
                <TextInput
                  style={styles.input}
                  placeholder="End Date"
                  value={endDate}
                  onChangeText={setEndDate}
                  editable={false}
                  onPressIn={() => toggleDatePicker('end')}
                />
              </Pressable>
            )
          }
        </View>

        <TextInput
            style={styles.input}
            placeholder="Additional Description"
            multiline
            value={description}
            onChangeText={setDescription}
        />

      <TouchableOpacity onPress={handleSubmit} style={styles.button}>
        <Text style={styles.buttonText}>Submit</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    backgroundColor: 'transparent',
    height: 40,
    width: "100%",
    color: 'black',
    borderWidth: 1.5,
    borderRadius: 50,
    borderColor: '#11182711',
    paddingHorizontal: 20,
    marginBottom: 16
  },
  subinput: {
    width: 160
  },
  imageButton: {
    padding: 10,
    width: 165,
    height: 125,
    borderWidth: 2,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 16,
  },
  editButton: {
    position: "absolute",
    bottom: 0,
    right: -40,
    backgroundColor: "white",
    padding: 5,
    borderRadius: 50,
  },
  imageButtonText: {
    color: "white",
    fontSize: 16,
  },
  image: {
    width: 160,
    height: 120,
    marginTop: -10,
  },
  button: {
    backgroundColor: "#4285F4",
    padding: 10,
    borderRadius: 5,
    width: "100%",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 16,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
  },
  datePicker: {
    height: 150,
    marginTop: -10,
  },
  pickerButton: {
    paddingHorizontal: 20,
    borderRadius: 50,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#11182711',
    marginBottom: 10,
  },
});
