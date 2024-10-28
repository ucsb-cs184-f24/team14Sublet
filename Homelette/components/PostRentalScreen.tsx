import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

// haiboyang@umail.ucsb.edu

export default function PostRentalScreen() {
    const [address, setAddress] = useState('');
    const [aptNumber, setAptNumber] = useState('');
    const [bathrooms, setBathrooms] = useState('');
    const [bedrooms, setBedrooms] = useState('');
    const [type, setType] = useState('');
    const [price, setPrice] = useState('');
    const [description, setDescription] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [image, setImage] = useState(null);
    const [area, setArea] = useState(null);
    
    const handleSubmit = () => {
        if (!address || !bathrooms || !bedrooms || !type || !price || !description || !area || !startDate || !endDate) {
            alert('Please fill in all the required fields.');
        return;
    }
    
    const rentalData = {
        address,
        area,
        bathrooms,
        bedrooms,
        type,
        price,
        description
    };

    console.log('Rental data submitted:', rentalData);
    alert('Rental information submitted!');
  };

  const handleImageUpload = async() => {
    try {
      await ImagePicker.requestCameraPermissionsAsync();
      let result = await ImagePicker.launchCameraAsync({
        cameraType: ImagePicker.CameraType.Front,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });
      if (!result.cancelled) {
        console.log(result.assets[0].url);
        await saveImage(result.assets[0].uri);
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
        quality: 1,
      });
      if (!result.cancelled) {
        console.log(result.assets[0].url);
        await saveImage(result.assets[0].uri);
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


  return (
    <View style={styles.container}>
        <Text style={styles.header}>Post Your Lease</Text>

        <View style={{ flexDirection : 'row'}}>
        <TouchableOpacity style={styles.imageButton}>
          <TouchableOpacity style={styles.editButton} onPress={handleImageSelect}>
            <MaterialCommunityIcons name="view-gallery-outline" size={24} color="black" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.editButton2} onPress={handleImageUpload}>
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

        <View style={{ flexDirection : 'row' }}>
            <TextInput
                style={styles.input}
                placeholder="Apartment Number"
                value={aptNumber}
                onChangeText={setAptNumber}
            />
            <TextInput
                style={styles.input}
                placeholder="Area"
                value={area}
                onChangeText={setArea}
            />
        </View>

        <View style={{ flexDirection: 'row' }}>
            <TextInput
                style={styles.input}
                placeholder="Number of Bedrooms"
                keyboardType="numeric"
                value={bedrooms}
                onChangeText={setBedrooms}
            />
            <TextInput
                style={styles.input}
                placeholder="Number of Bathrooms"
                keyboardType="numeric"
                value={bathrooms}
                onChangeText={setBathrooms}
            />
        </View>

        <View style={{ flexDirection: 'row' }}>
          <TextInput
            style={styles.input}
            placeholder="Type (e.g., Apartment, House)"
            value={type}
            onChangeText={setType}
          />

          <TextInput
            style={styles.input}
            placeholder="Price per Month ($)"
            keyboardType="numeric"
            value={price}
            onChangeText={setPrice}
        />
        </View>

        <View style={{ flexDirection : 'row'}}>
            <TextInput
                style={styles.input}
                placeholder="Start Date"
                value={startDate}
                onChangeText={setStartDate}
            />
            <TextInput
                style={styles.input}
                placeholder="End Date"
                value={endDate}
                onChangeText={setEndDate}
            />
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
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
  },
  imageButton: {
    padding: 10,
    borderRadius: 75,
    width: 75,
    height: 75,
    borderWidth: 2,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 16,
  },
  editButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "white",
    padding: 5,
    borderRadius: 50,
  },
  editButton2: {
    position: "absolute",
    bottom: 40,
    right: 0,
    backgroundColor: "white",
    padding: 5,
    borderRadius: 50,
  },
  imageButtonText: {
    color: "white",
    fontSize: 16,
  },
  image: {
    width: 60,
    height: 60,
  },
  button: {
    backgroundColor: "#4285F4",
    padding: 10,
    borderRadius: 5,
    width: "100%",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 16,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
  },
});