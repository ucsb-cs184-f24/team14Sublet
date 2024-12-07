import React, { useState } from 'react';
import { View, StyleSheet, Image, TouchableOpacity, Alert, ScrollView, Platform } from 'react-native';
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
  const [startDateObj, setStartDateObj] = useState(new Date());
  const [endDateObj, setEndDateObj] = useState(new Date());
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
        [{
          text: "OK", onPress: () => {
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
    if (event.type === 'dismissed') {
      toggleDatePicker(key);
      return;
    }

    if (selectedDate) {
      if (key === 'start') {
        setShowStartPicker(Platform.OS === 'ios');
        setStartDateObj(selectedDate);
        setStartDate(formatDate(selectedDate));
      } else {
        setShowEndPicker(Platform.OS === 'ios');
        setEndDateObj(selectedDate);
        setEndDate(formatDate(selectedDate));
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

  // const confirmIOSDate = (key) => {
  //   if (key === 'start') {
  //     setStartDate(formatDate(date));
  //   } else {
  //     setEndDate(formatDate(date));
  //   }
  //   toggleDatePicker(key);
  // };

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
          left={(props) => <MaterialCommunityIcons {...props} name="home-plus" size={40} color="#FFD700" />}
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
                  <MaterialCommunityIcons name="image-plus" size={40} color="#FFD700" />
                  <Text style={styles.placeholderText}>Add Property Photos</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          <ThemedText type="subtitle" style={styles.sectionTitle}>
            <MaterialCommunityIcons name="map-marker" size={24} color="#FFD700" />
            {" Address Information"}
          </ThemedText>
          <View style={styles.inputGroup}>
            <View style={styles.row}>
              <TextInput
                style={[styles.input, { flex: 2, marginRight: 8 }]}
                label="Street Address"
                value={streetAddress}
                onChangeText={setStreetAddress}
                mode="outlined"
                outlineColor="#FFD700"
                activeOutlineColor="#FFD700"
              />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                label="Apt/Unit"
                value={aptNumber}
                onChangeText={setAptNumber}
                mode="outlined"
                outlineColor="#FFD700"
                activeOutlineColor="#FFD700"
              />
            </View>

            <View style={styles.row}>
              <TextInput
                style={[styles.input, { flex: 1, marginRight: 8 }]}
                label="City"
                value={city}
                onChangeText={setCity}
                mode="outlined"
                outlineColor="#FFD700"
                activeOutlineColor="#FFD700"
              />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                label="State"
                value={state}
                onChangeText={setState}
                mode="outlined"
                outlineColor="#FFD700"
                activeOutlineColor="#FFD700"
              />
            </View>

            <View style={styles.row}>
              <TextInput
                style={[styles.input, { flex: 1, marginRight: 8 }]}
                label="ZIP Code"
                value={zip}
                onChangeText={setZip}
                mode="outlined"
                outlineColor="#FFD700"
                activeOutlineColor="#FFD700"
                keyboardType="numeric"
              />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                label="Area (sq ft)"
                value={area}
                onChangeText={setArea}
                mode="outlined"
                outlineColor="#FFD700"
                activeOutlineColor="#FFD700"
                keyboardType="numeric"
              />
            </View>
          </View>

          <ThemedText type="subtitle" style={styles.sectionTitle}>
            <MaterialCommunityIcons name="home" size={24} color="#FFD700" />
            {" Property Details"}
          </ThemedText>
          <View style={styles.inputGroup}>
            <View style={styles.row}>
              <TextInput
                style={[styles.input, { flex: 1, marginRight: 8 }]}
                label="Bedrooms"
                value={bedCount}
                onChangeText={setBedCount}
                mode="outlined"
                outlineColor="#FFD700"
                activeOutlineColor="#FFD700"
                keyboardType="numeric"
              />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                label="Bathrooms"
                value={bathCount}
                onChangeText={setBathCount}
                mode="outlined"
                outlineColor="#FFD700"
                activeOutlineColor="#FFD700"
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
                outlineColor="#FFD700"
                activeOutlineColor="#FFD700"
                keyboardType="numeric"
              />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                label="Property Type"
                value={type}
                onChangeText={setType}
                mode="outlined"
                outlineColor="#FFD700"
                activeOutlineColor="#FFD700"
              />
            </View>

            <TextInput
              style={[styles.input, styles.multilineInput]}
              label="Description"
              value={description}
              onChangeText={setDescription}
              mode="outlined"
              outlineColor="#FFD700"
              activeOutlineColor="#FFD700"
              multiline
              numberOfLines={4}
            />
          </View>

          <ThemedText type="subtitle" style={styles.sectionTitle}>
            <MaterialCommunityIcons name="calendar-month" size={24} color="#FFD700" />
            {" Lease Period"}
          </ThemedText>
          <View style={styles.inputGroup}>
            <View style={styles.dateInputContainer}>
              <TextInput
                style={styles.dateInput}
                label="Start Date"
                value={startDate}
                mode="outlined"
                outlineColor="#FFD700"
                activeOutlineColor="#FFD700"
                right={<TextInput.Icon icon="calendar" onPress={() => toggleDatePicker('start')} />}
                onPressIn={() => toggleDatePicker('start')}
                editable={false}
              />

              {showStartPicker && (
                <DateTimePicker
                  value={startDateObj}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(event, date) => onChangeDatePicker('start', event, date)}
                  minimumDate={new Date('2024-9-1')}
                />
              )}
            </View>

            <View style={styles.dateInputContainer}>
              <TextInput
                style={styles.dateInput}
                label="End Date"
                value={endDate}
                mode="outlined"
                outlineColor="#FFD700"
                activeOutlineColor="#FFD700"
                right={<TextInput.Icon icon="calendar" onPress={() => toggleDatePicker('end')} />}
                onPressIn={() => toggleDatePicker('end')}
                editable={false}
              />

              {showEndPicker && (
                <DateTimePicker
                  value={endDateObj}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(event, date) => onChangeDatePicker('end', event, date)}
                  minimumDate={new Date('2024-9-1')}
                />
              )}
            </View>
          </View>

          <Button
            mode="contained"
            onPress={handleSubmit}
            style={styles.submitButton}
            buttonColor="#FFD700"
            textColor="#000000"
            icon="check"
          >
            Post Lease
          </Button>
        </Card.Content>
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
    elevation: 4,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    ...(Platform?.OS === 'ios' ? {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    } : {}),
  },
  headerIconContainer: {
    marginLeft: -4,
    marginRight: 8,
    justifyContent: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginLeft: 8,
  },
  imageSection: {
    marginBottom: 24,
  },
  imageButton: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F5F5F5',
    borderWidth: 2,
    borderColor: '#FFD700',
    borderStyle: 'dashed',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    marginTop: 8,
    color: '#000000',
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#000000',
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputGroup: {
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#FFFFFF',
  },
  multilineInput: {
    marginTop: 12,
    height: 120,
  },
  dateInputContainer: {
    marginBottom: 12,
  },
  dateInput: {
    backgroundColor: '#FFFFFF',
  },
  datePickerContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    ...(Platform?.OS === 'ios' ? {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    } : {
      elevation: 4,
    }),
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  datePickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  closeButton: {
    padding: 4,
  },
  datePicker: {
    height: 200,
    marginBottom: 16,
  },
  datePickerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  datePickerButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  cancelButton: {
    borderColor: '#666666',
  },
  confirmButton: {
    borderColor: '#FFD700',
  },
  submitButton: {
    marginTop: 24,
    paddingVertical: 8,
    borderRadius: 8,
  },
});