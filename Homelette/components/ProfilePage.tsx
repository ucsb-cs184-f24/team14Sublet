import React from "react";
import { useState, useEffect } from "react";
import { View, ScrollView, Alert, Text, Image, Modal, TouchableOpacity, StyleSheet, RefreshControl } from "react-native";
import { Card, Title, Paragraph, Button, TextInput, Surface, Chip, IconButton, Portal, Dialog } from "react-native-paper";
import { ThemedText } from "./ThemedText";
import { firestore } from "../config/firebase";
import { doc, getDoc, collection, query, where, getDocs, deleteDoc, updateDoc, arrayRemove } from "firebase/firestore";
import { useAuth } from "@/hooks/useAuth";
import { updateUserProfile } from "../config/firebase";
import { signOut } from "firebase/auth";
import { auth } from "@/config/firebase";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from "@react-navigation/native";

// Color theme matching RentPage.tsx
const theme = {
  colors: {
    primary: "#FFD700", // Main yellow for buttons and primary elements
    secondary: "#2E3192", // Accent blue for interactive elements
    surface: "#FFFFFC", // White for cards and surfaces
    background: "#F5F5F5", // Light gray for app background
    error: "#FF6B6B", // Red for error messages
    text: "#333333", // Dark gray for general text
    primaryContainer: "#FFD70020", // Light yellow background for buttons and containers
    onPrimaryContainer: "#0D1321", // Rich black for text/icons on primary containers
    chatButton: "#FFD700", // Yellow for the chat button
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

// Edit Listing Modal Component
const EditListingModal = ({ visible, onDismiss, property, onSave }) => {
  const [editForm, setEditForm] = useState({
    type: '',
    bedrooms: '',
    bathrooms: '',
    area: '',
    street_address: '',
    apt_number: '',
    city: '',
    state: '',
    zip_code: ''
  });

  // Update form when property changes
  useEffect(() => {
    if (property) {
      setEditForm({
        type: property.type?.toString() || '',
        bedrooms: property.bedrooms?.toString() || '',
        bathrooms: property.bathrooms?.toString() || '',
        area: property.area?.toString() || '',
        street_address: property.address?.street_address || '',
        apt_number: property.apt_number?.toString() || '',
        city: property.address?.city || '',
        state: property.address?.state || '',
        zip_code: property.address?.zip_code || ''
      });
    }
  }, [property]);

  const handleSave = async () => {
    try {
      const propertyRef = doc(firestore, "properties", property.id);
      await updateDoc(propertyRef, {
        type: editForm.type,
        bedrooms: Number(editForm.bedrooms),
        bathrooms: Number(editForm.bathrooms),
        area: Number(editForm.area),
        apt_number: editForm.apt_number,
        address: {
          street_address: editForm.street_address,
          city: editForm.city,
          state: editForm.state,
          zip_code: editForm.zip_code
        }
      });
      onSave();
      onDismiss();
    } catch (error) {
      console.error("Error updating property:", error);
      Alert.alert("Error", "Failed to update property. Please try again.");
    }
  };

  const inputTheme = {
    colors: {
      primary: '#FFD700',
      background: 'transparent',
      placeholder: '#666666',
      text: '#000000',
    },
  };

  return (
    <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={styles.modalContainer}>
      <View style={styles.modalStatusBarSpace} />
      <Card style={styles.modalCard}>
        <Card.Title 
          title="Edit Property" 
          titleStyle={styles.modalTitle}
          style={styles.modalTitleContainer}
        />
        <Card.Content style={styles.modalContent}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Property Details</Text>
              <TextInput
                label="Property Type"
                value={editForm.type}
                onChangeText={(text) => setEditForm(prev => ({ ...prev, type: text }))}
                style={styles.input}
                theme={inputTheme}
                mode="outlined"
              />
              <View style={styles.rowInputs}>
                <TextInput
                  label="Bedrooms"
                  value={editForm.bedrooms}
                  onChangeText={(text) => setEditForm(prev => ({ ...prev, bedrooms: text }))}
                  style={[styles.input, styles.halfInput]}
                  keyboardType="numeric"
                  theme={inputTheme}
                  mode="outlined"
                />
                <TextInput
                  label="Bathrooms"
                  value={editForm.bathrooms}
                  onChangeText={(text) => setEditForm(prev => ({ ...prev, bathrooms: text }))}
                  style={[styles.input, styles.halfInput]}
                  keyboardType="numeric"
                  theme={inputTheme}
                  mode="outlined"
                />
              </View>
              <TextInput
                label="Area (sq ft)"
                value={editForm.area}
                onChangeText={(text) => setEditForm(prev => ({ ...prev, area: text }))}
                style={styles.input}
                keyboardType="numeric"
                theme={inputTheme}
                mode="outlined"
              />
            </View>

            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Address Information</Text>
              <TextInput
                label="Street Address"
                value={editForm.street_address}
                onChangeText={(text) => setEditForm(prev => ({ ...prev, street_address: text }))}
                style={styles.input}
                theme={inputTheme}
                mode="outlined"
              />
              <TextInput
                label="Apartment Number"
                value={editForm.apt_number}
                onChangeText={(text) => setEditForm(prev => ({ ...prev, apt_number: text }))}
                style={styles.input}
                theme={inputTheme}
                mode="outlined"
              />
              <View style={styles.rowInputs}>
                <TextInput
                  label="City"
                  value={editForm.city}
                  onChangeText={(text) => setEditForm(prev => ({ ...prev, city: text }))}
                  style={[styles.input, styles.halfInput]}
                  theme={inputTheme}
                  mode="outlined"
                />
                <TextInput
                  label="State"
                  value={editForm.state}
                  onChangeText={(text) => setEditForm(prev => ({ ...prev, state: text }))}
                  style={[styles.input, styles.halfInput]}
                  theme={inputTheme}
                  mode="outlined"
                />
              </View>
              <TextInput
                label="ZIP Code"
                value={editForm.zip_code}
                onChangeText={(text) => setEditForm(prev => ({ ...prev, zip_code: text }))}
                style={styles.input}
                keyboardType="numeric"
                theme={inputTheme}
                mode="outlined"
              />
            </View>
          </ScrollView>
        </Card.Content>
        <Card.Actions style={styles.modalActions}>
          <Button 
            onPress={onDismiss}
            mode="outlined"
            textColor="#000000"
            style={styles.modalButton}
          >
            Cancel
          </Button>
          <Button 
            onPress={handleSave}
            mode="contained"
            style={[styles.modalButton, styles.saveButton]}
            textColor="#000000"
          >
            Save Changes
          </Button>
        </Card.Actions>
      </Card>
    </Modal>
  );
};

// Property Card Component
const PropertyCard = ({ property, onEdit, onDelete }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  return (
    <Card style={styles.propertyCard}>
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
        <Dialog 
          visible={showDeleteConfirm} 
          onDismiss={() => setShowDeleteConfirm(false)}
          style={{ backgroundColor: theme.colors.surface }}
        >
          <Dialog.Title style={{ color: theme.colors.text }}>Delete Property</Dialog.Title>
          <Dialog.Content>
            <Paragraph style={{ color: theme.colors.text }}>Are you sure you want to delete this property? This action cannot be undone.</Paragraph>
          </Dialog.Content>
          <Dialog.Actions style={{ justifyContent: 'space-around', paddingHorizontal: 16, paddingBottom: 8 }}>
            <Button 
              onPress={() => setShowDeleteConfirm(false)}
              textColor={theme.colors.text}
              style={{ minWidth: 100, borderColor: theme.colors.primary }}
            >
              Cancel
            </Button>
            <Button 
              onPress={() => {
                setShowDeleteConfirm(false);
                onDelete(property.id);
              }}
              mode="contained"
              buttonColor={theme.colors.primary}
              textColor={theme.colors.text}
              style={{ minWidth: 100 }}
            >
              Delete
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </Card>
  );
};

// Saved Property Card Component
const SavedPropertyCard = ({ property, onRemove }) => {
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleRemove = () => {
    setShowConfirmation(true);
  };

  return (
    <Card style={styles.propertyCard}>
      <Portal>
        <Dialog 
          visible={showConfirmation} 
          onDismiss={() => setShowConfirmation(false)}
          style={styles.dialog}
        >
          <Dialog.Title style={styles.dialogTitle}>Remove Listing</Dialog.Title>
          <Dialog.Content>
            <Paragraph style={styles.dialogContent}>Are you sure you want to remove this listing?</Paragraph>
          </Dialog.Content>
          <Dialog.Actions style={styles.dialogActions}>
            <Button 
              onPress={() => setShowConfirmation(false)}
              textColor={theme.colors.text}
              style={styles.dialogButton}
            >
              Cancel
            </Button>
            <Button 
              onPress={() => {
                setShowConfirmation(false);
                onRemove(property.id);
              }}
              mode="contained"
              buttonColor={theme.colors.primary}
              textColor={theme.colors.text}
              style={styles.dialogButton}
            >
              Remove
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <View style={styles.propertyImageWrapper}>
        {property.image_url ? (
          <Image 
            source={{ uri: property.image_url }} 
            style={styles.propertyImage}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.propertyImage, styles.propertyImagePlaceholder]}>
            <MaterialCommunityIcons name="image-off" size={40} color="#666" />
          </View>
        )}
        <TouchableOpacity 
          style={styles.favoriteButton}
          onPress={handleRemove}
        >
          <MaterialCommunityIcons name="heart" size={24} color={theme.colors.error} />
        </TouchableOpacity>
      </View>

      <Card.Content style={styles.propertyContent}>
        <View style={styles.propertyHeader}>
          <View>
            <Title style={styles.propertyType}>{property.type}</Title>
            <Paragraph style={styles.propertyAddress} numberOfLines={2}>
              {property.address.street_address}, {property.address.city}, {property.address.state} {property.address.zip_code}
            </Paragraph>
          </View>
        </View>

        <View style={styles.propertyStats}>
          <View style={styles.propertyStat}>
            <MaterialCommunityIcons name="bed" size={20} color="#666" />
            <Text style={styles.propertyStatText}>
              {property.bedrooms === 0 ? 'Studio' : property.bedrooms}
            </Text>
          </View>
          <View style={styles.propertyStatDivider} />
          <View style={styles.propertyStat}>
            <MaterialCommunityIcons name="shower" size={20} color="#666" />
            <Text style={styles.propertyStatText}>{property.bathrooms}</Text>
          </View>
          <View style={styles.propertyStatDivider} />
          <View style={styles.propertyStat}>
            <MaterialCommunityIcons name="ruler-square" size={20} color="#666" />
            <Text style={styles.propertyStatText}>{property.area} ft²</Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  );
};

export function ProfilePage() {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [userData, setUserData] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [favoritedListings, setFavoritedListings] = useState([]);
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
  const [editingProperty, setEditingProperty] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

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

  const fetchFavoritedListings = async () => {
    if (!user) return;
    try {
      const userDoc = await getDoc(doc(firestore, "users", user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const listingIds = userData.interested_listing_ids || [];
        
        const listings = [];
        for (const id of listingIds) {
          const listingDoc = await getDoc(doc(firestore, "listings", id));
          if (listingDoc.exists()) {
            const listingData = listingDoc.data();
            // Get the property data
            const propertyDoc = await getDoc(doc(firestore, "properties", listingData.property_id));
            if (propertyDoc.exists()) {
              const propertyData = propertyDoc.data();
              // Transform the data to match the expected structure
              listings.push({
                id: listingDoc.id,
                type: propertyData.type || 'Apartment',
                address: propertyData.address || {
                  street_address: propertyData.street_address || '',
                  city: propertyData.city || '',
                  state: propertyData.state || '',
                  zip_code: propertyData.zip_code || ''
                },
                bedrooms: propertyData.bedrooms || 0,
                bathrooms: propertyData.bathrooms || 0,
                area: propertyData.area || 0,
                image_url: propertyData.image_url || null,
                rent: listingData.price || 0,
                startDate: listingData.start_date,
                endDate: listingData.end_date
              });
            }
          }
        }
        setFavoritedListings(listings);
      }
    } catch (error) {
      console.error("Error fetching favorited listings:", error);
      Alert.alert("Error", "Failed to fetch saved listings");
    }
  };

  const fetchUserData = async () => {
    if (user) {
      const userDocRef = doc(firestore, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        setUserData(userData);
        
        // Fetch properties and favorited listings
        await Promise.all([
          fetchUserProperties(),
          fetchFavoritedListings()
        ]);
      } else {
        console.log("No such document!");
      }
    }
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchUserData();
    } catch (error) {
      console.error("Error refreshing data:", error);
      Alert.alert("Error", "Failed to refresh data. Please try again later.");
    } finally {
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
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

  const handleRemoveFavorite = async (listingId: string) => {
    if (!user) return;
    
    try {
      const userRef = doc(firestore, "users", user.uid);
      const listingRef = doc(firestore, "listings", listingId);

      await updateDoc(userRef, {
        interested_listing_ids: arrayRemove(listingId)
      });
      await updateDoc(listingRef, {
        interested_user_ids: arrayRemove(user.uid)
      });

      // Update local state
      setFavoritedListings(prev => prev.filter(listing => listing.id !== listingId));
    } catch (error) {
      console.error("Error removing favorite:", error);
      Alert.alert("Error", "Failed to remove listing from saved items");
    }
  };

  const handleEditProperty = (property) => {
    setEditingProperty(property);
  };

  const handleSaveProperty = async () => {
    // Refresh the properties list after saving
    await fetchUserProperties();
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
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[theme.colors.primary]}
          tintColor={theme.colors.primary}
          progressBackgroundColor="#ffffff"
        />
      }
    >
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
                      onPress={() => navigation.navigate("index")} 
                      style={styles.exploreButton}
                      textColor={theme.colors.text}
                    >
                      Explore Listings
                    </Button>
                  </View>
                ) : (
                  favoritedListings.map((listing) => (
                    <SavedPropertyCard key={listing.id} property={listing} onRemove={handleRemoveFavorite} />
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
                      onPress={() => navigation.navigate("post")} 
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
      <EditListingModal
        visible={editingProperty !== null}
        onDismiss={() => setEditingProperty(null)}
        property={editingProperty}
        onSave={handleSaveProperty}
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
  propertyCard: {
    marginVertical: 8,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 20,
    marginTop: 20,
  },
  modalStatusBarSpace: {
    height: 40,
  },
  modalCard: {
    width: '100%',
    maxHeight: '90%',
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
  },
  modalTitleContainer: {
    backgroundColor: '#FFD700',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
  },
  modalContent: {
    padding: 15,
  },
  formSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#000000',
  },
  input: {
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  rowInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  halfInput: {
    flex: 1,
  },
  modalActions: {
    padding: 15,
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  modalButton: {
    marginLeft: 10,
    borderColor: '#FFD700',
  },
  saveButton: {
    backgroundColor: '#FFD700',
  },
  propertyAddress: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  propertyStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  propertyStat: {
    alignItems: 'center',
    flex: 1,
  },
  propertyStatDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  propertyStatText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 4,
  },
  favoriteButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  dialog: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 8,
  },
  dialogTitle: {
    color: theme.colors.text,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
  },
  dialogContent: {
    color: theme.colors.text,
    textAlign: 'center',
  },
  dialogActions: {
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  dialogButton: {
    minWidth: 100,
  },
});