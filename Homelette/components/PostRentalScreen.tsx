import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Image, TouchableOpacity, Pressable, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';

// haiboyang@umail.ucsb.edu

export default function PostRentalScreen() {
  const [address, setAddress] = useState('');
  const [aptNumber, setAptNumber] = useState('');
  const [area, setArea] = useState('');
  const [bathCount, setBathCount] = useState('');
  const [bedCount, setBedCount] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [image, setImage] = useState(null);

  const [date, setDate] = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
    
  const handleSubmit = () => {
    if (!address || !bathCount || !bedCount || !price || !description || !area || !startDate || !endDate) {
        alert('Please fill in all the required fields.');
        return;
    }
    const rentalData = {
        address,
        area,
        bathCount,
        bedCount,
        price,
        startDate,
        endDate,
        description
    };

    console.log('Rental data submitted:', rentalData);
    alert('Rental information submitted!');
  };

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

        <TextInput
          style={styles.input}
          placeholder="Price per Month ($)"
          keyboardType="numeric"
          value={price}
          onChangeText={setPrice}
        />

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
    width: 120,
    height: 120,
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
    width: 115,
    height: 115,
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