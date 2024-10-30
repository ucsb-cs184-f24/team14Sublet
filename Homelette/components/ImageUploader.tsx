import React, { useState } from 'react';
import { Platform, View, Image, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Button } from 'react-native-paper';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/config/firebase';
import { ThemedText } from './ThemedText';

export function ImageUploader() {
  const [uploading, setUploading] = useState(false);
  const [image, setImage] = useState<string | null>(null);

  const pickImage = async () => {
    try {
      // Request permissions (only needed for mobile)
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          alert('Sorry, we need camera roll permissions to make this work!');
          return;
        }
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        const uri = result.assets[0].uri;
        setImage(uri);
        await uploadImage(uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      alert('Error picking image');
    }
  };

  const uploadImage = async (uri: string) => {
    try {
      setUploading(true);

      // Convert image to blob for Firebase Storage
      const response = await fetch(uri);
      const blob = await response.blob();

      // Create a unique filename
      const filename = `lease-images/${Date.now()}-${Math.random().toString(36).substring(7)}`;
      const storageRef = ref(storage, filename);

      // Upload to Firebase Storage
      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);

      console.log('File uploaded successfully:', downloadURL);
      alert('Image uploaded successfully!');
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error uploading image');
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Button
        mode="contained"
        onPress={pickImage}
        loading={uploading}
        disabled={uploading}
        style={styles.button}
      >
        Upload Image
      </Button>
      {image && (
        <Image source={{ uri: image }} style={styles.preview} />
      )}
      {uploading && (
        <ThemedText>Uploading...</ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 10,
  },
  button: {
    marginVertical: 10,
  },
  preview: {
    width: 200,
    height: 200,
    marginTop: 10,
    resizeMode: 'contain',
  },
}); 