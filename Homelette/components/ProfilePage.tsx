import React, { useState, useEffect } from "react";
import { View, StyleSheet, Image, Modal, ScrollView } from "react-native";
import { Card, Title, Paragraph, Button, TextInput, Surface, Chip } from "react-native-paper";
import { ThemedText } from "./ThemedText"; // Ensure this exists or replace with a `Text` component
import { firestore } from "../config/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useAuth } from "@/hooks/useAuth";
import { updateUserProfile } from "../config/firebase";

// Mock data for favorited listings
const mockFavoritedListings = [
  {
    id: "1",
    address: "123 Main St",
    rent: 1200,
    startDate: "2023-09-04",
    endDate: "2024-08-31",
    image: "https://via.placeholder.com/150",
    bedCount: 3,
    bathCount: 2,
    area: 900,
  },
  {
    id: "2",
    address: "456 Elm St",
    rent: 1500,
    startDate: "2023-10-01",
    endDate: "2024-09-30",
    image: "https://via.placeholder.com/150",
    bedCount: 4,
    bathCount: 3,
    area: 1400,
  },
];

// Color theme matching RentPage.tsx
const theme = {
  colors: {
    primary: "#FFD700",
    secondary: "#2E3192",
    surface: "#FFFFFC",
    background: "#F5F5F5",
    text: "#333333",
    primaryContainer: "#FFD70020",
  },
};

// Favorited Listing Card Component
const FavoritedListingCard = ({ item, onRemoveFavorite }) => {
  return (
    <Surface elevation={2} style={styles.favoritedListingCard}>
      <View style={styles.favoritedListingContent}>
        <Image source={{ uri: item.image }} style={styles.favoritedListingImage} />
        <View style={styles.favoritedListingDetails}>
          <Title style={styles.favoritedListingTitle}>${item.rent}/mo</Title>
          <Paragraph style={styles.favoritedListingAddress}>{item.address}</Paragraph>
          <View style={styles.favoritedListingChips}>
            <Chip icon="bed" style={styles.favoritedListingChip} textStyle={styles.chipText}>
              {item.bedCount} beds
            </Chip>
            <Chip icon="shower" style={styles.favoritedListingChip} textStyle={styles.chipText}>
              {item.bathCount} baths
            </Chip>
          </View>
          <Button
            mode="contained"
            onPress={() => onRemoveFavorite(item.id)}
            style={styles.removeFavoriteButton}
            buttonColor={theme.colors.primary}
          >
            Remove
          </Button>
        </View>
      </View>
    </Surface>
  );
};

// Edit Profile Modal Component
const EditProfileModal = ({ visible, onClose, onSave, editForm, setEditForm }) => {
  const handleInputChange = (field, value) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Modal visible={visible} transparent={true} animationType="slide" onRequestClose={onClose}>
      <View style={modalStyles.modalContainer}>
        <Card style={modalStyles.modalCard}>
          <Card.Content>
            <Title style={modalStyles.modalTitle}>Edit Profile</Title>
            <TextInput
              label="First Name"
              value={editForm.first}
              onChangeText={(value) => handleInputChange("first", value)}
              style={modalStyles.input}
            />
            <TextInput
              label="Last Name"
              value={editForm.last}
              onChangeText={(value) => handleInputChange("last", value)}
              style={modalStyles.input}
            />
            <TextInput
              label="Phone Number"
              value={editForm.phone}
              onChangeText={(value) => handleInputChange("phone", value)}
              keyboardType="phone-pad"
              style={modalStyles.input}
            />
            <View style={modalStyles.modalActions}>
              <Button onPress={onClose} mode="text" style={modalStyles.cancelButton}>
                Cancel
              </Button>
              <Button onPress={onSave} mode="contained" style={modalStyles.saveButton}>
                Save
              </Button>
            </View>
          </Card.Content>
        </Card>
      </View>
    </Modal>
  );
};

// Main Profile Page Component
export function ProfilePage() {
  const { user } = useAuth();
  const [userData, setUserData] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [favoritedListings, setFavoritedListings] = useState(mockFavoritedListings);
  const [editForm, setEditForm] = useState({
    first: "",
    last: "",
    phone: "",
  });

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        const userDoc = await getDoc(doc(firestore, "users", user.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        }
      }
    };
    fetchUserData();
  }, [user]);

  const handleSave = () => {
    updateUserProfile(user.uid, editForm)
      .then(() => {
        setIsEditing(false); // Close modal after saving
        setUserData((prev) => ({ ...prev, ...editForm }));
      })
      .catch((error) => {
        console.error("Error saving profile:", error);
      });
  };

  const handleRemoveFavorite = (listingId: string) => {
    setFavoritedListings((prev) => prev.filter((listing) => listing.id !== listingId));
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollViewContent}>
      {/* Profile Card */}
      <Card style={styles.profileCard}>
        <Card.Content>
          <Title style={styles.profileTitle}>{userData?.first || "Your Name"}</Title>
          <Paragraph>{userData?.email || "Your Email"}</Paragraph>
          <Button mode="outlined" onPress={() => setIsEditing(true)} style={styles.editProfileButton}>
            Edit Profile
          </Button>
        </Card.Content>
      </Card>

      {/* Favorited Listings Section */}
      <Card style={styles.favoritedListingsCard}>
        <Card.Content>
          <View style={styles.sectionHeader}>
            <ThemedText type="subtitle">Favorited Listings</ThemedText>
            <Chip style={styles.favoritesCountChip} textStyle={styles.chipText}>
              {favoritedListings.length}
            </Chip>
          </View>
          {favoritedListings.length === 0 ? (
            <View style={styles.emptyFavoritesContainer}>
              <ThemedText>No favorited listings yet</ThemedText>
              <Button mode="outlined" onPress={() => {}} style={styles.exploreListingsButton}>
                Explore Listings
              </Button>
            </View>
          ) : (
            favoritedListings.map((listing) => (
              <FavoritedListingCard key={listing.id} item={listing} onRemoveFavorite={handleRemoveFavorite} />
            ))
          )}
        </Card.Content>
      </Card>

      {/* Edit Profile Modal */}
      <EditProfileModal
        visible={isEditing}
        onClose={() => setIsEditing(false)}
        onSave={handleSave}
        editForm={editForm}
        setEditForm={setEditForm}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  profileCard: {
    marginTop: 16,
    borderRadius: 12,
    backgroundColor: theme.colors.surface,
  },
  profileTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: theme.colors.text,
  },
  editProfileButton: {
    marginTop: 16,
  },
  favoritedListingsCard: {
    marginTop: 16,
    borderRadius: 12,
    backgroundColor: theme.colors.surface,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  favoritesCountChip: {
    backgroundColor: theme.colors.primaryContainer,
  },
  favoritedListingCard: {
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: theme.colors.surface,
  },
  favoritedListingContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  favoritedListingImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
    marginRight: 16,
  },
  favoritedListingDetails: {
    flex: 1,
  },
  favoritedListingTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: theme.colors.text,
  },
  favoritedListingAddress: {
    marginVertical: 4,
    color: theme.colors.text,
  },
  favoritedListingChips: {
    flexDirection: "row",
    gap: 8,
    marginVertical: 8,
  },
  favoritedListingChip: {
    backgroundColor: theme.colors.primaryContainer,
  },
  chipText: {
    color: theme.colors.text,
  },
  removeFavoriteButton: {
    marginTop: 8,
    borderRadius: 8,
  },
  emptyFavoritesContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  exploreListingsButton: {
    marginTop: 16,
  },
  scrollViewContent: {
    paddingBottom: 32,
  },
});

const modalStyles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalCard: {
    width: "90%",
    padding: 16,
    borderRadius: 12,
  },
  modalTitle: {
    textAlign: "center",
    marginBottom: 16,
  },
  input: {
    marginBottom: 12,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
  },
  saveButton: {
    flex: 1,
    marginLeft: 8,
  },
});
