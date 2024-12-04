import React, { useState } from 'react';
import { View, StyleSheet, Image, TouchableOpacity, Platform, Alert, ScrollView } from 'react-native';
import { Card, TextInput, Button, Title, Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { addDoc, collection, doc, arrayUnion, updateDoc } from 'firebase/firestore';
import { auth, firestore, storage } from '@/config/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { ThemedText } from './ThemedText';

export default function PostRentalScreen() {
  const [streetAddress, setStreetAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');
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
  const [menuVisible, setMenuVisible] = useState(false);

  const handleSubmit = async () => {
    try {
      if (!streetAddress || !bathCount || !bedCount || !price || !description || !area || !startDate || !endDate || !type || !city || !state || !zip) {
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
      const address = {
        apt_number: aptNumber,
        city: city,
        state: state,
        street_address: streetAddress,
        zip_code: zip
      }
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
        end_date: endDate,
        end_date_TEST: endDate,
        interested_users_ids: [],

        price: price,
        start_date: startDate,
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

      await addDoc(collection(firestore, "listings"), newListing);

      const userRef = doc(firestore, "users", auth.currentUser?.uid);
      await updateDoc(userRef, {
        listing_ids: arrayUnion(propertyId),
      });

      Alert.alert(
        "Success",
        "Your property is submitted",
        [{ text: "OK", onPress: () => {
          clearForms();
          console.log("OK Pressed");
        }
        }]
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

  const clearForms = () => {
    setStreetAddress('');
    setCity('');
    setState('');
    setZip('');
    setAptNumber('');
    setArea('');
    setBathCount('');
    setBedCount('');
    setPrice('');
    setType('');
    setDescription('');
    setStartDate('');
    setEndDate('');
    setImage('');
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

    return `${year}-${month}-${day}`;
  };

  const confirmIOSDate = (key) => {
    if (key === 'start') {
      setStartDate(formatDate(date));
    } else {
      setEndDate(formatDate(date));
    }
    toggleDatePicker(key);
  };

  const handleImageUpload = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant camera permissions to take photos');
        return;
      }

      let result = await ImagePicker.launchCameraAsync({
        cameraType: ImagePicker.CameraType.Front,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.5,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        await saveImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const handleImageSelect = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant media library permissions to select photos');
        return;
      }

      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.5,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        await saveImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error selecting photo:', error);
      Alert.alert('Error', 'Failed to select photo. Please try again.');
    }
  };

  const saveImage = async (uri: string) => {
    try {
      setImage(uri);
    } catch (error) {
      console.error('Error saving image:', error);
      Alert.alert('Error', 'Failed to save image. Please try again.');
    }
  };

  const saveImageToFirebase = async () => {
    try {
      if (!image) {
        throw new Error('No image selected');
      }

      // Convert URI to Blob
      const response = await fetch(image);
      const blob = await response.blob();

      // Create a storage reference
      const storageRef = ref(storage, `images/${Date.now()}.jpg`);

      // Upload the blob to Firebase Storage
      await uploadBytes(storageRef, blob);

      // Get the download URL and return it
      const downloadURL = await getDownloadURL(storageRef);
      return downloadURL;
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Error', 'Failed to upload image. Please try again.');
      throw error;
    }
  };

  const showImageMenu = () => {
    Alert.alert(
      'Add Photo',
      'Choose a method to add a photo',
      [
        {
          text: 'Take Photo',
          onPress: handleImageUpload,
        },
        {
          text: 'Choose from Library',
          onPress: handleImageSelect,
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Title
          title="Post Your Lease"
          titleStyle={styles.header}
        />
        <Card.Content>
          <View style={styles.imageSection}>
            <TouchableOpacity style={styles.imageButton} onPress={showImageMenu}>
              {image ? (
                <Image
                  source={{ uri: image }}
                  style={styles.image}
                />
              ) : (
                <View style={styles.placeholderContainer}>
                  <MaterialCommunityIcons name="image-plus" size={40} color="#006aff" />
                  <Text style={styles.placeholderText}>Tap to add photos</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          <ThemedText type="subtitle" style={styles.sectionTitle}>Address Information</ThemedText>
          <View style={styles.inputGroup}>
            <View style={styles.row}>
              <TextInput
                style={[styles.input, { flex: 2, marginRight: 8 }]}
                label="Street Address"
                value={streetAddress}
                onChangeText={setStreetAddress}
                mode="outlined"
                outlineColor="#006aff"
                activeOutlineColor="#006aff"
              />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                label="Apt/Unit"
                value={aptNumber}
                onChangeText={setAptNumber}
                mode="outlined"
                outlineColor="#006aff"
                activeOutlineColor="#006aff"
              />
            </View>

            <View style={styles.row}>
              <TextInput
                style={[styles.input, { flex: 1, marginRight: 8 }]}
                label="City"
                value={city}
                onChangeText={setCity}
                mode="outlined"
                outlineColor="#006aff"
                activeOutlineColor="#006aff"
              />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                label="State"
                value={state}
                onChangeText={setState}
                mode="outlined"
                outlineColor="#006aff"
                activeOutlineColor="#006aff"
              />
            </View>

            <View style={styles.row}>
              <TextInput
                style={[styles.input, { flex: 1, marginRight: 8 }]}
                label="ZIP Code"
                value={zip}
                onChangeText={setZip}
                mode="outlined"
                outlineColor="#006aff"
                activeOutlineColor="#006aff"
                keyboardType="numeric"
              />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                label="Area (sq ft)"
                value={area}
                onChangeText={setArea}
                mode="outlined"
                outlineColor="#006aff"
                activeOutlineColor="#006aff"
                keyboardType="numeric"
              />
            </View>
          </View>

          <ThemedText type="subtitle" style={styles.sectionTitle}>Property Details</ThemedText>
          <View style={styles.inputGroup}>
            <View style={styles.row}>
              <TextInput
                style={[styles.input, { flex: 1, marginRight: 8 }]}
                label="Bedrooms"
                value={bedCount}
                onChangeText={setBedCount}
                mode="outlined"
                outlineColor="#006aff"
                activeOutlineColor="#006aff"
                keyboardType="numeric"
              />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                label="Bathrooms"
                value={bathCount}
                onChangeText={setBathCount}
                mode="outlined"
                outlineColor="#006aff"
                activeOutlineColor="#006aff"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.row}>
              <TextInput
                style={[styles.input, { flex: 1, marginRight: 8 }]}
                label="Monthly Rent ($)"
                value={price}
                onChangeText={setPrice}
                mode="outlined"
                outlineColor="#006aff"
                activeOutlineColor="#006aff"
                keyboardType="numeric"
              />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                label="Property Type"
                value={type}
                onChangeText={setType}
                mode="outlined"
                outlineColor="#006aff"
                activeOutlineColor="#006aff"
              />
            </View>

            <TextInput
              style={[styles.input, styles.textArea]}
              label="Description"
              value={description}
              onChangeText={setDescription}
              mode="outlined"
              outlineColor="#006aff"
              activeOutlineColor="#006aff"
              multiline
              numberOfLines={4}
            />
          </View>

          <ThemedText type="subtitle" style={styles.sectionTitle}>Lease Duration</ThemedText>
          <View style={styles.inputGroup}>
            <View>
              {showStartPicker && (
                <DateTimePicker
                  mode="date"
                  display="spinner"
                  value={date}
                  onChange={(event, selectedDate) => onChangeDatePicker('start', event, selectedDate)}
                  style={styles.datePicker}
                  minimumDate={new Date('2024-9-1')}
                />
              )}

              {showStartPicker && Platform.OS === 'ios' && (
                <View style={styles.dateButtonContainer}>
                  <Button
                    onPress={() => toggleDatePicker('start')}
                    mode="outlined"
                    textColor="#006aff"
                  >
                    Cancel
                  </Button>
                  <Button
                    onPress={() => confirmIOSDate('start')}
                    mode="contained"
                    buttonColor="#006aff"
                  >
                    Confirm
                  </Button>
                </View>
              )}

              {!showStartPicker && (
                <TextInput
                  style={styles.input}
                  label="Start Date"
                  value={startDate}
                  mode="outlined"
                  outlineColor="#006aff"
                  activeOutlineColor="#006aff"
                  right={<TextInput.Icon icon="calendar" />}
                  onPressIn={() => toggleDatePicker('start')}
                  editable={false}
                />
              )}
            </View>

            <View>
              {showEndPicker && (
                <DateTimePicker
                  mode="date"
                  display="spinner"
                  value={date}
                  onChange={(event, selectedDate) => onChangeDatePicker('end', event, selectedDate)}
                  style={styles.datePicker}
                  minimumDate={new Date('2024-9-1')}
                />
              )}

              {showEndPicker && Platform.OS === 'ios' && (
                <View style={styles.dateButtonContainer}>
                  <Button
                    onPress={() => toggleDatePicker('end')}
                    mode="outlined"
                    textColor="#006aff"
                  >
                    Cancel
                  </Button>
                  <Button
                    onPress={() => confirmIOSDate('end')}
                    mode="contained"
                    buttonColor="#006aff"
                  >
                    Confirm
                  </Button>
                </View>
              )}

              {!showEndPicker && (
                <TextInput
                  style={styles.input}
                  label="End Date"
                  value={endDate}
                  mode="outlined"
                  outlineColor="#006aff"
                  activeOutlineColor="#006aff"
                  right={<TextInput.Icon icon="calendar" />}
                  onPressIn={() => toggleDatePicker('end')}
                  editable={false}
                />
              )}
            </View>
          </View>
        </Card.Content>

        <Card.Actions style={styles.actions}>
          <Button
            mode="contained"
            onPress={handleSubmit}
            buttonColor="#006aff"
            style={styles.submitButton}
          >
            Post Listing
          </Button>
        </Card.Actions>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F5F5F5',
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: 'white',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    paddingTop: 16,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
  },
  input: {
    backgroundColor: 'white',
    marginBottom: 12,
  },
  textArea: {
    height: 100,
    backgroundColor: 'white',
  },
  imageSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  imageButton: {
    width: 200,
    height: 150,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#006aff',
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: 'white',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    marginTop: 8,
    color: '#006aff',
    fontSize: 16,
  },
  inputGroup: {
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  datePicker: {
    height: 150,
    marginTop: -10,
  },
  dateButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  actions: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    alignItems: 'center',
  },
  submitButton: {
    width: '100%',
    height: 48,
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12,
  },
});
