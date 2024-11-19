import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Text,
  Image,
  Platform,
} from "react-native";
import { ThemedText } from "./ThemedText";
import { signIn, signUp } from "@/config/firebase";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";

export function WelcomePage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [major, setMajor] = useState("");
  const [graduationYear, setGraduationYear] = useState("");
  const [aboutMe, setAboutMe] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState("");
  const [currentStep, setCurrentStep] = useState(1); // Step 1: Email/Password; Step 2: Optional Info

  const eduEmailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[eE][dD][uU]$/;

  const pickImage = async () => {
    if (Platform.OS !== "web") {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        alert("Sorry, we need camera roll permissions to make this work!");
        return;
      }
    }

    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error("ImagePicker Error:", error);
      setError("Failed to select image. Please try again.");
    }
  };

  const takePhoto = async () => {
    if (Platform.OS !== "web") {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        alert("Sorry, we need camera permissions to make this work!");
        return;
      }
    }

    try {
      let result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Camera Error:", error);
      setError("Failed to take photo. Please try again.");
    }
  };

  const handleAuth = async () => {
    setError("");

    if (!eduEmailRegex.test(email)) {
      setError("Please enter a valid .edu email address.");
      return;
    }

    if (!isLogin) {
      if (!firstName.trim() || !lastName.trim()) {
        setError("Please enter your first and last names.");
        return;
      }
    }

    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        const options = {
          major: major.trim() !== "" ? major.trim() : undefined,
          graduationYear: graduationYear
            ? parseInt(graduationYear, 10)
            : undefined,
          aboutMe: aboutMe.trim() !== "" ? aboutMe.trim() : undefined,
          profilePicture: profileImage
            ? {
                uri: profileImage,
                name: `profile_${Date.now()}.jpg`,
                type: "image/jpeg",
              }
            : undefined,
        };

        await signUp(email, password, firstName, lastName, options);
      }
    } catch (error) {
      console.error("Authentication Error:", error);
      setError(
        "Authentication failed. Please check your credentials and try again.",
      );
    }
  };

  return (
    <View style={styles.container}>
      <ThemedText style={styles.title}>Welcome to Homelette</ThemedText>

      {currentStep === 1 && (
        <>
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          {!isLogin && (
            <>
              <TextInput
                style={styles.input}
                placeholder="First Name"
                value={firstName}
                onChangeText={setFirstName}
                autoCapitalize="words"
                autoCorrect={false}
              />
              <TextInput
                style={styles.input}
                placeholder="Last Name"
                value={lastName}
                onChangeText={setLastName}
                autoCapitalize="words"
                autoCorrect={false}
              />
              <TouchableOpacity
                style={styles.button}
                onPress={() => setCurrentStep(2)}
              >
                <ThemedText style={styles.buttonText}>Next</ThemedText>
              </TouchableOpacity>
            </>
          )}
        </>
      )}

      {currentStep === 2 && (
        <>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setCurrentStep(1)}
          >
            <ThemedText style={styles.backButtonText}>Back</ThemedText>
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            placeholder="Major (Optional)"
            value={major}
            onChangeText={setMajor}
            autoCapitalize="words"
            autoCorrect={false}
          />
          <TextInput
            style={styles.input}
            placeholder="Graduation Year (Optional)"
            value={graduationYear}
            onChangeText={setGraduationYear}
            keyboardType="numeric"
            maxLength={4}
          />
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="About Me (Optional)"
            value={aboutMe}
            onChangeText={setAboutMe}
            multiline
            numberOfLines={4}
          />
          <View style={styles.profileContainer}>
            <TouchableOpacity onPress={takePhoto} style={styles.iconButton}>
              <Ionicons name="camera" size={30} color="#4285F4" />
            </TouchableOpacity>
            <View style={styles.imagePicker}>
              {profileImage ? (
                <Image
                  source={{ uri: profileImage }}
                  style={styles.profileImage}
                />
              ) : (
                <Text style={styles.imagePickerText}>Profile Picture</Text>
              )}
            </View>
            <TouchableOpacity onPress={pickImage} style={styles.iconButton}>
              <Ionicons name="images" size={30} color="#4285F4" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.button} onPress={handleAuth}>
            <ThemedText style={styles.buttonText}>Sign Up</ThemedText>
          </TouchableOpacity>
        </>
      )}

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
        <ThemedText style={styles.switchText}>
          {isLogin
            ? "Need an account? Sign Up"
            : "Already have an account? Login"}
        </ThemedText>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    width: "100%",
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  button: {
    backgroundColor: "#4285F4",
    padding: 10,
    borderRadius: 5,
    width: "100%",
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
  },
  backButton: {
    backgroundColor: "#ccc",
    padding: 10,
    borderRadius: 5,
    width: "100%",
    alignItems: "center",
    marginBottom: 10,
  },
  backButtonText: {
    color: "black",
    fontSize: 16,
  },
  switchText: {
    marginTop: 15,
    color: "#4285F4",
  },
  errorText: {
    color: "red",
    marginBottom: 10,
    textAlign: "center",
  },
  profileContainer: {
    marginTop: 15,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  iconButton: {
    padding: 20,
  },
  imagePicker: {
    width: 100,
    height: 100,
    alignItems: "center",
    justifyContent: "center",
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 15,
    overflow: "hidden",
  },
  imagePickerText: {
    color: "#777",
  },
  profileImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
});
