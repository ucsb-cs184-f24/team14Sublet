import React from "react";
import { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, Image, Modal } from "react-native";
import { Card, Title, Paragraph, Button, TextInput, Surface, Chip } from "react-native-paper";
import { ThemedText } from "./ThemedText";
import { firestore } from "../config/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useAuth } from "@/hooks/useAuth";
import { updateUserProfile } from "../config/firebase";
import { signOut } from "firebase/auth";
import { auth } from "@/config/firebase";

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

// Add these interfaces at the top of the file
interface EditFormData {
  first: string;
  last: string;
  phone: string;
  about_me: string;
  major: string;
  graduation_year: string;
}

interface EditProfileModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: () => void;
  editForm: EditFormData;
  setEditForm: React.Dispatch<React.SetStateAction<EditFormData>>;
}

const EditProfileModal = ({ visible, onClose, onSave, editForm, setEditForm }: EditProfileModalProps) => (
  <Modal
    visible={visible}
    animationType="slide"
    transparent={true}
    onRequestClose={onClose}
  >
    <View style={styles.modalContainer}>
      <Card style={styles.modalCard}>
        <Card.Title title="Edit Profile" titleStyle={styles.modalTitle} />
        <Card.Content>
          <TextInput
            label="First Name"
            value={editForm.first}
            onChangeText={(text) => setEditForm(prev => ({ ...prev, first: text }))}
            style={styles.input}
            mode="outlined"
            outlineColor="#006aff"
            activeOutlineColor="#006aff"
            textColor="black"
            theme={{
              colors: {
                primary: '#006aff',
                background: 'white',
                text: 'black',
                placeholder: 'gray',
                onSurfaceVariant: 'black',
              },
            }}
          />
          <TextInput
            label="Last Name"
            value={editForm.last}
            onChangeText={(text) => setEditForm(prev => ({ ...prev, last: text }))}
            style={styles.input}
            mode="outlined"
            outlineColor="#006aff"
            activeOutlineColor="#006aff"
            textColor="black"
            theme={{
              colors: {
                primary: '#006aff',
                background: 'white',
                text: 'black',
                placeholder: 'gray',
                onSurfaceVariant: 'black',
              },
            }}
          />
          <TextInput
            label="Phone Number"
            value={editForm.phone}
            onChangeText={(text) => setEditForm(prev => ({ ...prev, phone: text }))}
            keyboardType="numeric"
            style={styles.input}
            mode="outlined"
            outlineColor="#006aff"
            activeOutlineColor="#006aff"
            textColor="black"
            theme={{
              colors: {
                primary: '#006aff',
                background: 'white',
                text: 'black',
                placeholder: 'gray',
                onSurfaceVariant: 'black',
              },
            }}
          />
          <TextInput
            label="Major"
            value={editForm.major}
            onChangeText={(text) => setEditForm(prev => ({ ...prev, major: text }))}
            style={styles.input}
            mode="outlined"
            outlineColor="#006aff"
            activeOutlineColor="#006aff"
            textColor="black"
            theme={{
              colors: {
                primary: '#006aff',
                background: 'white',
                text: 'black',
                placeholder: 'gray',
                onSurfaceVariant: 'black',
              },
            }}
          />
          <TextInput
            label="Graduation Year"
            value={editForm.graduation_year}
            onChangeText={(text) => setEditForm(prev => ({ ...prev, graduation_year: text }))}
            keyboardType="numeric"
            style={styles.input}
            mode="outlined"
            outlineColor="#006aff"
            activeOutlineColor="#006aff"
            textColor="black"
            theme={{
              colors: {
                primary: '#006aff',
                background: 'white',
                text: 'black',
                placeholder: 'gray',
                onSurfaceVariant: 'black',
              },
            }}
          />
          <TextInput
            label="About Me"
            value={editForm.about_me}
            onChangeText={(text) => setEditForm(prev => ({ ...prev, about_me: text }))}
            style={[styles.input, styles.about_meInput]}
            mode="outlined"
            outlineColor="#006aff"
            activeOutlineColor="#006aff"
            textColor="black"
            multiline
            numberOfLines={4}
            theme={{
              colors: {
                primary: '#006aff',
                background: 'white',
                text: 'black',
                placeholder: 'gray',
                onSurfaceVariant: 'black',
              },
            }}
          />
        </Card.Content>
        <Card.Actions>
          <Button
            onPress={onClose}
            textColor="#006aff"
          >
            Cancel
          </Button>
          <Button
            onPress={onSave}
            mode="contained"
            buttonColor="#006aff"
          >
            Save
          </Button>
        </Card.Actions>
      </Card>
    </View>
  </Modal>
);

export function ProfilePage() {
  const { user } = useAuth();
  const [userData, setUserData] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [favoritedListings, setFavoritedListings] = useState(mockFavoritedListings);
  const [editForm, setEditForm] = useState<EditFormData>({
    first: '',
    last: '',
    phone: '',
    about_me: '',
    major: '',
    graduation_year: '',
  });

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        const userDocRef = doc(firestore, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          setUserData(userData);
          console.log(userData);
        } else {
          console.log("No such document!");
        }
      }
    };

    fetchUserData();
  }, [user]);

  const handleEditPress = () => {
    setEditForm({
      first: userData?.first || '',
      last: userData?.last || '',
      phone: userData?.phone?.toString() || '',
      about_me: userData?.about_me || '',
      major: userData?.major || '',
      graduation_year: userData?.graduation_year || '',
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      const updates = {
        first: editForm.first,
        last: editForm.last,
        phone: parseInt(editForm.phone) || 0,
        about_me: editForm.about_me,
        major: editForm.major,
        graduation_year: editForm.graduation_year,
      };

      await updateUserProfile(user.uid, updates);

      // Update local state
      setUserData(prev => ({
        ...prev,
        ...updates
      }));

      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Sign Out Error:", error);
    }
  };

  const handleRemoveFavorite = (listingId: string) => {
    setFavoritedListings((prev) => prev.filter((listing) => listing.id !== listingId));
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollViewContent}>
      <View style={styles.container}>
        <Card style={styles.profileCard}>
          <View style={styles.headerSection}>
            <Image
              source={
                userData?.profilePictureURL
                  ? { uri: userData.profilePictureURL }
                  : require("../assets/images/default-pfp.png")
              }
              style={styles.profileImage}
            />
            <View style={styles.headerInfo}>
              <Title>{`${userData?.first} ${userData?.last}`}</Title>
              <Paragraph>{userData?.school || ""}</Paragraph>
            </View>
          </View>

          <Card.Content>
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <ThemedText type="title">
                  {userData?.listing_ids?.length}
                </ThemedText>
                <ThemedText>Listings</ThemedText>
              </View>
              <View style={styles.statItem}>
                <ThemedText type="title">
                  {userData?.interested_listing_ids?.length}
                </ThemedText>
                <ThemedText>Interested In</ThemedText>
              </View>
              <View style={styles.statItem}>
                <ThemedText type="title">{userData?.rating || "N/A"}</ThemedText>
                <ThemedText>Rating</ThemedText>
              </View>
            </View>

            <View style={styles.infoSection}>
              <ThemedText type="subtitle">About Me</ThemedText>
              <ThemedText>{userData?.about_me || "N/A"}</ThemedText>
            </View>

            <View style={styles.infoSection}>
              <ThemedText type="subtitle">Details</ThemedText>
              <View style={styles.detailItem}>
                <ThemedText type="defaultSemiBold">Major:</ThemedText>
                <ThemedText>{userData?.major || "N/A"}</ThemedText>
              </View>
              <View style={styles.detailItem}>
                <ThemedText type="defaultSemiBold">Graduation Year:</ThemedText>
                <ThemedText>{userData?.graduation_year || "N/A"}</ThemedText>
              </View>
              <View style={styles.detailItem}>
                <ThemedText type="defaultSemiBold">Email:</ThemedText>
                <ThemedText>{userData?.email}</ThemedText>
              </View>
              <View style={styles.detailItem}>
                <ThemedText type="defaultSemiBold">Member Since:</ThemedText>
                <ThemedText>
                  {userData?.join_date?.toDate().toLocaleDateString()}
                </ThemedText>
              </View>
            </View>
          </Card.Content>

          <Card.Actions>
            <Button mode="contained" onPress={handleEditPress}>
              Edit Profile
            </Button>
            <Button mode="outlined" onPress={handleSignOut}>
              Sign Out
            </Button>
          </Card.Actions>
        </Card>

        <EditProfileModal
          visible={isEditing}
          onClose={() => setIsEditing(false)}
          onSave={handleSave}
          editForm={editForm}
          setEditForm={setEditForm}
        />
      </View>
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
              <Button mode="outlined" onPress={() => { }} style={styles.exploreListingsButton}>
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12,
    backgroundColor: theme.colors.background,
  },
  profileCard: {
    borderRadius: 12,
    backgroundColor: theme.colors.surface,
  },
  headerSection: {
    flexDirection: "row",
    padding: 16,
    alignItems: "center",
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  headerInfo: {
    marginLeft: 16,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 16,
    borderRadius: 8,
    backgroundColor: "#f8f8f8",
    padding: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  statItem: {
    alignItems: "center",
  },
  infoSection: {
    marginVertical: 16,
  },
  detailItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 4,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 20,
  },
  modalCard: {
    padding: 20,
    backgroundColor: "white",
    elevation: 5,
  },
  modalTitle: {
    color: "black",
    fontSize: 20,
    fontWeight: "bold",
  },
  input: {
    marginBottom: 15,
    backgroundColor: "white",
    height: 56,
  },
  about_meInput: {
    height: 120,
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