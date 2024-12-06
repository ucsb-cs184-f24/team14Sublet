import React from "react";
import { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, Image, Modal, TouchableOpacity, Alert } from "react-native";
import { Card, Title, Paragraph, Button, TextInput, Surface, Chip, IconButton, Portal, Dialog } from "react-native-paper";
import { ThemedText } from "./ThemedText";
import { firestore } from "../config/firebase";
import { doc, getDoc, collection, query, where, getDocs, deleteDoc, updateDoc } from "firebase/firestore";
import { useAuth } from "@/hooks/useAuth";
import { updateUserProfile } from "../config/firebase";
import { signOut } from "firebase/auth";
import { auth } from "@/config/firebase";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from "@react-navigation/native";

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

// Property Card Component
const PropertyCard = ({ property, onEdit, onDelete }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  return (
    <Surface elevation={2} style={styles.propertyCardContainer}>
      <View style={styles.propertyImageWrapper}>
        {property.image_url ? (
          <Image 
            source={{ uri: property.image_url }} 
            style={styles.propertyImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.propertyImagePlaceholder}>
            <MaterialCommunityIcons name="home" size={40} color="#666" />
          </View>
        )}
      </View>

      <View style={styles.propertyContent}>
        <View style={styles.propertyHeader}>
          <View>
            <ThemedText style={styles.propertyTypeText}>{property.type}</ThemedText>
            <View style={styles.propertyLocationRow}>
              <MaterialCommunityIcons name="map-marker" size={14} color={theme.colors.text} />
              <ThemedText numberOfLines={1} style={styles.propertyAddressText}>
                {property.address.street_address}
                {property.apt_number ? ` #${property.apt_number}` : ''}
              </ThemedText>
            </View>
            <ThemedText style={styles.propertySubAddressText}>
              {property.address.city}, {property.address.state} {property.address.zip_code}
            </ThemedText>
          </View>
          <View style={styles.propertyActions}>
            <IconButton
              icon="pencil"
              size={20}
              iconColor={theme.colors.text}
              onPress={() => onEdit(property)}
            />
            <IconButton
              icon="delete"
              size={20}
              iconColor={theme.colors.error}
              onPress={() => setShowDeleteConfirm(true)}
            />
          </View>
        </View>

        <View style={styles.propertyDetailsGrid}>
          <View style={styles.propertyDetailItem}>
            <MaterialCommunityIcons name="bed" size={18} color={theme.colors.text} />
            <ThemedText style={styles.propertyDetailValue}>{property.bedrooms}</ThemedText>
            <ThemedText style={styles.propertyDetailLabel}>Beds</ThemedText>
          </View>
          <View style={styles.propertyDetailSeparator} />
          <View style={styles.propertyDetailItem}>
            <MaterialCommunityIcons name="shower" size={18} color={theme.colors.text} />
            <ThemedText style={styles.propertyDetailValue}>{property.bathrooms}</ThemedText>
            <ThemedText style={styles.propertyDetailLabel}>Baths</ThemedText>
          </View>
          <View style={styles.propertyDetailSeparator} />
          <View style={styles.propertyDetailItem}>
            <MaterialCommunityIcons name="ruler" size={18} color={theme.colors.text} />
            <ThemedText style={styles.propertyDetailValue}>
              {Number(property.area).toLocaleString()}
            </ThemedText>
            <ThemedText style={styles.propertyDetailLabel}>Sq Ft</ThemedText>
          </View>
        </View>

        <View style={styles.propertyMetrics}>
          <View style={styles.propertyMetricBadge}>
            <MaterialCommunityIcons name="heart" size={16} color={theme.colors.text} />
            <ThemedText style={styles.propertyMetricText}>
              {property.favorites?.length || 0} favorites
            </ThemedText>
          </View>
          <View style={styles.propertyMetricBadge}>
            <MaterialCommunityIcons name="chat" size={16} color={theme.colors.text} />
            <ThemedText style={styles.propertyMetricText}>
              {property.chats?.length || 0} chats
            </ThemedText>
          </View>
        </View>
      </View>

      <Portal>
        <Dialog visible={showDeleteConfirm} onDismiss={() => setShowDeleteConfirm(false)}>
          <Dialog.Title>Delete Property</Dialog.Title>
          <Dialog.Content>
            <Paragraph>Are you sure you want to delete this property? This action cannot be undone.</Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowDeleteConfirm(false)}>Cancel</Button>
            <Button 
              onPress={() => {
                setShowDeleteConfirm(false);
                onDelete(property.id);
              }}
              textColor={theme.colors.error}
            >
              Delete
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </Surface>
  );
};

export function ProfilePage() {
  const { user } = useAuth();
  const navigation = useNavigation();
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
  const [userProperties, setUserProperties] = useState([]);
  const [isLoadingProperties, setIsLoadingProperties] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        const userDocRef = doc(firestore, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          setUserData(userData);
          console.log(userData);
          
          // Fetch properties
          const fetchUserProperties = async () => {
            if (!user) return;
            
            setIsLoadingProperties(true);
            try {
              // Get user's listing IDs
              const userDocRef = doc(firestore, "users", user.uid);
              const userDoc = await getDoc(userDocRef);
              const listingIds = userDoc.data()?.listing_ids || [];
              
              // Fetch each property
              const properties = [];
              for (const id of listingIds) {
                const propertyRef = doc(firestore, "properties", id);
                const propertyDoc = await getDoc(propertyRef);
                if (propertyDoc.exists()) {
                  properties.push({
                    id: propertyDoc.id,
                    ...propertyDoc.data()
                  });
                }
              }
              
              setUserProperties(properties);
            } catch (error) {
              console.error("Error fetching properties:", error);
              Alert.alert("Error", "Failed to fetch your properties. Please try again later.");
            } finally {
              setIsLoadingProperties(false);
            }
          };
          fetchUserProperties();
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

  const handleEditProperty = (property) => {
    navigation.navigate("EditListing", { listingId: property.id });
  };

  const handleDeleteProperty = async (propertyId) => {
    try {
      // Delete property document
      await deleteDoc(doc(firestore, "properties", propertyId));
      
      // Update user's listing_ids
      const updatedListingIds = userData.listing_ids.filter(id => id !== propertyId);
      await updateDoc(doc(firestore, "users", user.uid), {
        listing_ids: updatedListingIds
      });
      
      // Update local state
      setUserProperties(prev => prev.filter(p => p.id !== propertyId));
      setUserData(prev => ({
        ...prev,
        listing_ids: updatedListingIds
      }));
      
      Alert.alert("Success", "Property deleted successfully");
    } catch (error) {
      console.error("Error deleting property:", error);
      Alert.alert("Error", "Failed to delete property. Please try again later.");
    }
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
                    {userProperties.length}
                  </Chip>
                </View>
                {isLoadingProperties ? (
                  <View style={styles.emptyContainer}>
                    <ThemedText>Loading...</ThemedText>
                  </View>
                ) : userProperties.length === 0 ? (
                  <View style={styles.emptyContainer}>
                    <ThemedText>You haven't posted any listings yet</ThemedText>
                    <Button 
                      mode="outlined" 
                      onPress={() => navigation.navigate("PostLease")} 
                      style={styles.exploreButton}
                      textColor={theme.colors.text}
                    >
                      Post a Listing
                    </Button>
                  </View>
                ) : (
                  <View style={styles.propertiesContainer}>
                    {userProperties.map((property) => (
                      <PropertyCard
                        key={property.id}
                        property={property}
                        onEdit={handleEditProperty}
                        onDelete={handleDeleteProperty}
                      />
                    ))}
                  </View>
                )}
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
  propertiesContainer: {
    marginTop: 16,
  },
  propertyCardContainer: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  propertyImageWrapper: {
    height: 180,
    backgroundColor: '#f5f5f5',
  },
  propertyImage: {
    width: '100%',
    height: '100%',
  },
  propertyImagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  propertyContent: {
    padding: 16,
  },
  propertyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  propertyTypeText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  propertyLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  propertyAddressText: {
    fontSize: 15,
    flex: 1,
  },
  propertySubAddressText: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
    marginLeft: 18,
  },
  propertyActions: {
    flexDirection: 'row',
  },
  propertyDetailsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  propertyDetailItem: {
    alignItems: 'center',
    flex: 1,
  },
  propertyDetailSeparator: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  propertyDetailValue: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 4,
  },
  propertyDetailLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  propertyMetrics: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  propertyMetricBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primaryContainer,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  propertyMetricText: {
    fontSize: 13,
  },
});