import React from "react";
import { View, StyleSheet, TouchableOpacity, Image } from "react-native";
import { ThemedText } from "./ThemedText";
import { signOut, User } from "firebase/auth";
import { auth } from "@/config/firebase";
import { router } from "expo-router";

interface HomePageProps {
  user: User;
}

export function HomePage({ user }: HomePageProps) {
  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Sign Out Error:", error);
    }
  };

  const handleProfilePress = () => {
    router.push("/profile");
    console.log("Profile button pressed");
  };

  return (
    <View style={styles.container}>
      {/* Header with Profile Button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleProfilePress}>
          <Image
            source={
              user?.photoURL
                ? { uri: user.photoURL }
                : require("../assets/images/default-pfp.png")
            }
            style={styles.profileImage}
          />
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        <ThemedText style={styles.title}>Homelette Home Page</ThemedText>
        <ThemedText style={styles.userInfo}>User ID: {user.uid}</ThemedText>
        <ThemedText style={styles.userInfo}>Email: {user.email}</ThemedText>
        <TouchableOpacity style={styles.button} onPress={handleSignOut}>
          <ThemedText style={styles.buttonText}>Sign Out</ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const PROFILE_IMAGE_SIZE = 40;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff", // Optional: Set a background color
  },
  header: {
    width: "100%",
    padding: 15,
    alignItems: "flex-end",
    backgroundColor: "#f8f8f8", // Optional: Set a header background color
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  profileImage: {
    width: PROFILE_IMAGE_SIZE,
    height: PROFILE_IMAGE_SIZE,
    borderRadius: PROFILE_IMAGE_SIZE / 2,
  },
  // placeholder: {
  //   width: PROFILE_IMAGE_SIZE,
  //   height: PROFILE_IMAGE_SIZE,
  //   borderRadius: PROFILE_IMAGE_SIZE / 2,
  //   backgroundColor: "#4285F4",
  //   justifyContent: "center",
  //   alignItems: "center",
  // },
  // placeholderText: {
  //   color: "white",
  //   fontSize: 18,
  //   fontWeight: "bold",
  // },
  content: {
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
  userInfo: {
    fontSize: 16,
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#4285F4",
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
    width: "100%",
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
  },
});
