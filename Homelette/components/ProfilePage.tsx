import React from "react";
import { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, Image, Modal, TouchableOpacity } from "react-native";
import { Card, Title, Paragraph, Button, TextInput, Surface, Chip, IconButton } from "react-native-paper";
import { ThemedText } from "./ThemedText";
import { firestore } from "../config/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useAuth } from "@/hooks/useAuth";
import { updateUserProfile } from "../config/firebase";
import { signOut } from "firebase/auth";
import { auth } from "@/config/firebase";
import { MaterialCommunityIcons } from '@expo/vector-icons';

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
    <Surface elevation={2} style={styles.listingCard}>
      <View style={styles.listingContent}>
        <Image source={{ uri: item.image }} style={styles.listingImage} />
        <View style={styles.listingDetails}>
          <Title style={styles.listingTitle}>${item.rent}/mo</Title>
          <Paragraph style={styles.listingAddress}>{item.address}</Paragraph>
          <View style={styles.listingChips}>
            <Chip 
              icon={() => <MaterialCommunityIcons name="bed" size={16} color={theme.colors.text} />}
              style={styles.listingChip} 
              textStyle={[styles.chipText, { color: theme.colors.text }]}
              theme={{ colors: { surface: theme.colors.surface } }}
            >
              {item.bedCount} beds
            </Chip>
            <Chip 
              icon={() => <MaterialCommunityIcons name="shower" size={16} color={theme.colors.text} />}
              style={styles.listingChip} 
              textStyle={[styles.chipText, { color: theme.colors.text }]}
              theme={{ colors: { surface: theme.colors.surface } }}
            >
              {item.bathCount} baths
            </Chip>
          </View>
          <Button
            mode="contained"
            onPress={() => onRemoveFavorite(item.id)}
            style={styles.removeButton}
            buttonColor={theme.colors.primary}
            textColor={theme.colors.text}
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
  const [activeTab, setActiveTab] = useState('profile');
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
      {/* Profile Section */}
      <View style={styles.profileSection}>
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
                  {userData?.listing_ids?.length || 0}
                </ThemedText>
                <ThemedText>Listings</ThemedText>
              </View>
              <View style={styles.statItem}>
                <ThemedText type="title">
                  {userData?.interested_listing_ids?.length || 0}
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
            <Button 
              mode="contained" 
              onPress={handleEditPress}
              buttonColor={theme.colors.primary}
              textColor={theme.colors.text}
              style={styles.actionButton}
            >
              Edit Profile
            </Button>
            <Button 
              mode="outlined" 
              onPress={handleSignOut}
              textColor={theme.colors.text}
              style={[styles.actionButton, styles.signOutButton]}
            >
              Sign Out
            </Button>
          </Card.Actions>
        </Card>

        {/* Navigation Buttons */}
        <View style={styles.navigationButtons}>
          <TouchableOpacity 
            style={[styles.navButton, activeTab === 'favorites' && styles.activeNavButton]}
            onPress={() => setActiveTab('favorites')}
          >
            <MaterialCommunityIcons name="heart" size={24} color={theme.colors.text} />
            <ThemedText style={styles.navButtonText}>Saved</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.navButton, activeTab === 'myListings' && styles.activeNavButton]}
            onPress={() => setActiveTab('myListings')}
          >
            <MaterialCommunityIcons name="home" size={24} color={theme.colors.text} />
            <ThemedText style={styles.navButtonText}>My Listings</ThemedText>
          </TouchableOpacity>
        </View>

        {/* Listings Section */}
        {activeTab === 'favorites' && (
          <View style={styles.listingsSection}>
            <Card style={styles.listingsCard}>
              <Card.Content>
                <View style={styles.sectionHeader}>
                  <ThemedText type="subtitle">Saved</ThemedText>
                  <Chip style={styles.countChip} textStyle={{ color: theme.colors.text }}>
                    {favoritedListings.length}
                  </Chip>
                </View>
                {favoritedListings.length === 0 ? (
                  <View style={styles.emptyContainer}>
                    <ThemedText>No saved listings yet</ThemedText>
                    <Button 
                      mode="outlined" 
                      onPress={() => {}} 
                      style={styles.exploreButton}
                      textColor={theme.colors.text}
                    >
                      Explore Listings
                    </Button>
                  </View>
                ) : (
                  favoritedListings.map((listing) => (
                    <FavoritedListingCard 
                      key={listing.id} 
                      item={listing} 
                      onRemoveFavorite={handleRemoveFavorite} 
                    />
                  ))
                )}
              </Card.Content>
            </Card>
          </View>
        )}

        {activeTab === 'myListings' && (
          <View style={styles.listingsSection}>
            <Card style={styles.listingsCard}>
              <Card.Content>
                <View style={styles.sectionHeader}>
                  <ThemedText type="subtitle">My Listings</ThemedText>
                  <Chip style={styles.countChip} textStyle={{ color: theme.colors.text }}>
                    {userData?.listing_ids?.length || 0}
                  </Chip>
                </View>
                {/* Add My Listings content here */}
                <View style={styles.emptyContainer}>
                  <ThemedText>Coming soon!</ThemedText>
                </View>
              </Card.Content>
            </Card>
          </View>
        )}
      </View>

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
  scrollViewContent: {
    paddingBottom: 32,
  },
  profileSection: {
    padding: 16,
  },
  profileCard: {
    marginBottom: 16,
    backgroundColor: theme.colors.surface,
  },
  headerSection: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  headerInfo: {
    marginLeft: 16,
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 16,
    paddingHorizontal: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  infoSection: {
    marginVertical: 12,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  actionButton: {
    marginHorizontal: 8,
  },
  signOutButton: {
    borderColor: theme.colors.text,
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  navButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
    padding: 12,
    marginHorizontal: 8,
    borderRadius: 8,
    elevation: 2,
    minWidth: 120,
  },
  activeNavButton: {
    backgroundColor: theme.colors.primaryContainer,
  },
  navButtonText: {
    marginLeft: 8,
    fontWeight: '500',
  },
  listingsSection: {
    marginTop: 8,
  },
  listingsCard: {
    backgroundColor: theme.colors.surface,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  countChip: {
    backgroundColor: theme.colors.primaryContainer,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 24,
  },
  exploreButton: {
    marginTop: 12,
  },
  listingCard: {
    marginBottom: 16,
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
  },
  listingContent: {
    flexDirection: 'row',
    padding: 12,
  },
  listingImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  listingDetails: {
    flex: 1,
    marginLeft: 12,
  },
  listingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  listingAddress: {
    fontSize: 14,
    color: '#666',
  },
  listingChips: {
    flexDirection: 'row',
    marginTop: 8,
  },
  listingChip: {
    marginRight: 8,
    backgroundColor: theme.colors.primaryContainer,
  },
  chipText: {
    fontSize: 12,
  },
  removeButton: {
    marginTop: 8,
  },
});