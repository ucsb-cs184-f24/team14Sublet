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
import { WaveBackground } from './WaveBackground';
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
  const [currentStep, setCurrentStep] = useState(1);
  const [phone, setPhone] = useState("");

  const eduEmailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[eE][dD][uU]$/;

  const validateEmail = (email: string) => {
    return eduEmailRegex.test(email);
  };

  const validatePassword = (password: string) => {
    return password.length >= 6;
  };

  const validateStep1 = () => {
    if (!email.trim() || !password.trim()) {
      setError("Email and password are required");
      return false;
    }
    if (!validateEmail(email)) {
      setError("Please use a valid .edu email address");
      return false;
    }
    if (!validatePassword(password)) {
      setError("Password must be at least 6 characters long");
      return false;
    }
    if (!isLogin && (!firstName.trim() || !lastName.trim())) {
      setError("First name and last name are required");
      return false;
    }
    setError("");
    return true;
  };

  const handleNext = () => {
    if (validateStep1()) {
      setCurrentStep(2);
    }
  };

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
      <WaveBackground />
      <View style={styles.content}>
        <ThemedText style={styles.title}>Homelette</ThemedText>
        {currentStep === 1 && (
          <>
            {!isLogin && (
              <>
                <TextInput
                  style={styles.input}
                  placeholder="Email (.edu required)*"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoCorrect={false}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Password (min. 6 characters)*"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
                <TextInput
                  style={styles.input}
                  placeholder="First Name*"
                  value={firstName}
                  onChangeText={setFirstName}
                  autoCapitalize="words"
                  autoCorrect={false}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Last Name*"
                  value={lastName}
                  onChangeText={setLastName}
                  autoCapitalize="words"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  style={styles.button}
                  onPress={handleNext}
                >
                  <ThemedText style={styles.buttonText}>Next</ThemedText>
                </TouchableOpacity>
              </>
            )}
            {isLogin && (
              <>
                <TextInput
                  style={styles.input}
                  placeholder="Email (.edu)"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoCorrect={false}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              <TouchableOpacity style={styles.button} onPress={handleAuth}>
                <ThemedText style={styles.buttonText}>Login</ThemedText>
              </TouchableOpacity>
              </>
            )}
          </>
        )}

        {currentStep === 2 && (
          <>
            <View style={styles.stepHeader}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => setCurrentStep(1)}
              >
                <Ionicons name="chevron-back" size={24} color="#000000" />
                <ThemedText style={styles.backButtonText}>Back</ThemedText>
              </TouchableOpacity>
              <ThemedText style={styles.stepTitle}>Additional Information</ThemedText>
            </View>

            <View style={styles.profileImageContainer}>
              <TouchableOpacity style={styles.profileImageButton} onPress={pickImage}>
                {profileImage ? (
                  <Image
                    source={{ uri: profileImage }}
                    style={styles.profileImage}
                  />
                ) : (
                  <View style={styles.profileImagePlaceholder}>
                    <Ionicons name="person" size={40} color="#000000" />
                  </View>
                )}
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Phone Number (optional)"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              autoCorrect={false}
            />

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

            <TouchableOpacity style={styles.button} onPress={handleAuth}>
              <ThemedText style={styles.buttonText}>Sign Up</ThemedText>
            </TouchableOpacity>
          </>
        )}

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {/* Conditionally render the toggle only on Step 1 */}
        {currentStep === 1 && (
          <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
            <ThemedText style={styles.switchText}>
              {isLogin
                ? "Need an account? Sign Up"
                : "Already have an account? Login"}
            </ThemedText>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
  },
  title: {
    fontSize: 38,
    fontWeight: "900",
    marginBottom: 40,
    marginTop: 20,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0.5, height: 0.5 },
    textShadowRadius: 1.5,
    letterSpacing: 1,
    padding: 15,
  },
  input: {
    width: "85%",
    height: 45,
    borderColor: "#E0E0E0",
    borderWidth: 1.5,
    borderRadius: 8,
    marginBottom: 25,
    paddingHorizontal: 15,
    backgroundColor: 'rgba(250, 250, 250, 0.9)',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#F3B33D',
    padding: 12,
    borderRadius: 8,
    width: "50%",
    alignItems: "center",
    marginTop: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    color: '#000000', 
    fontSize: 18,
    fontWeight: "800",
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  backButtonText: {
    fontSize: 16,
    marginLeft: 4,
    color: '#000000',
    fontWeight: '600',
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  stepTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginRight: 10,
    color: '#000000',
  },
  stepDescription: {
    fontSize: 14,
    color: '#000000',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  profileImageContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImageButton: {
    width: 80,
    height: 80,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 60,
  },
  profileImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#F3B33D',
    borderStyle: 'dashed',
  },
  profileImageText: {
    fontSize: 14,
    color: '#000000',
    marginTop: 8,
  },
  switchText: {
    marginTop: 20,
    color: '#FFFFFF',
    fontSize: 15,
  },
  errorText: {
    color: 'red',
    marginTop: 10,
    marginBottom: 10,
    textAlign: "center",
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
});
