import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Image, TouchableOpacity } from 'react-native';

export default function PostRentalScreen() {
    const [address, setAddress] = useState('');
    const [zipCode, setZipCode] = useState('');
    const [bathrooms, setBathrooms] = useState('');
    const [bedrooms, setBedrooms] = useState('');
    const [type, setType] = useState('');
    const [price, setPrice] = useState('');
    const [description, setDescription] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    
    const handleSubmit = () => {
        if (!address || !bathrooms || !bedrooms || !type || !price || !description || !zipCode) {
            alert('Please fill in all the required fields.');
        return;
    }
    
    const rentalData = {
        address,
        zipCode,
        bathrooms,
        bedrooms,
        type,
        price,
        description
    };

    console.log('Rental data submitted:', rentalData);
    alert('Rental information submitted!');
  };

  return (
    <View style={styles.container}>
        <Text style={styles.header}>Post Your Rental Information</Text>

        <View>
            <TextInput
                style={styles.input}
                placeholder="Address"
                value={address}
                onChangeText={setAddress}
            />
            <TextInput
                style={styles.input}
                placeholder="Zip Code"
                value={zipCode}
                onChangeText={setZipCode}
            />
        </View>

        <View>
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

        <View>
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
    backgroundColor: "#4285F4",
    padding: 10,
    borderRadius: 5,
    width: "100%",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 16,
  },
  imageButtonText: {
    color: "white",
    fontSize: 16,
  },
  image: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
    borderRadius: 8,
    marginBottom: 16,
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