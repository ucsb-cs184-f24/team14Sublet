import React from "react";
import { View, StyleSheet, TouchableOpacity, Image } from "react-native";
import { ThemedText } from "./ThemedText";
import { signOut, User } from "firebase/auth";
import { auth } from "@/config/firebase";
import { router } from "expo-router";
import { RentPage } from '@/components/RentPage';

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
      <RentPage />
    </View>
  );
}

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
