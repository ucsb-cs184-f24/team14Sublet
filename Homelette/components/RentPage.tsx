import React, { useState, useEffect, useMemo } from "react";
import { StyleSheet, View, Dimensions, RefreshControl, Alert, Image } from "react-native";
import { getListings, auth, sendNewMessage, firestore } from "@/config/firebase";
import { doc, updateDoc, arrayUnion, arrayRemove, getDoc } from "firebase/firestore";
import MapView, { Marker, Callout } from "react-native-maps";
import {
  Card,
  Title,
  Paragraph,
  Text,
  Provider as PaperProvider,
  DefaultTheme,
  IconButton,
  Searchbar,
  Chip,
  Portal,
  Modal,
  Button,
  Divider,
  SegmentedButtons,
  FAB,
  Surface,
  TextInput,
} from "react-native-paper";
import { FlashList } from "@shopify/flash-list";
import axios from "axios";
import { useAuth } from "@/hooks/useAuth";
import LoadingEgg from "@/components/LoadingEgg";

// Custom theme for React Native Paper
const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: "#FFD700",
    secondary: "#2E3192",
    surface: "#FFFFFC",
    background: "#F5F5F5",
    error: "#FF6B6B",
    text: "#333333",
    primaryContainer: "#FFD70020",
    onPrimaryContainer: "#0D1321",
    chatButton: "#FFD700",
  },
};

// Types
interface Property {
  id: string;
  address: string;
  rent: number;
  startDate: string;
  endDate: string;
  image: string;
  bedCount: number;
  bathCount: number;
  area: number;
  latitude?: number;
  longitude?: number;
  authorId: string;
}

interface FilterOptions {
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  startDate?: Date;
}

// Helper function for geocoding
const getCoordinatesFromAddress = async (address: string): Promise<{ latitude: number, longitude: number } | null> => {
  const apiKey = "AIzaSyCVsuSPlVbAHwQNkMS6ui8Pni2NJQ_UMb8";
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;

  try {
    const response = await axios.get(url);
    if (response.data.status === "OK") {
      const { lat, lng } = response.data.results[0].geometry.location;
      return { latitude: lat, longitude: lng };
    }
    return null;
  } catch (error) {
    console.error("Error fetching geocoding data:", error);
    return null;
  }
};

// PropertyCard Component
const PropertyCard = ({
  item,
  isFavorite,
  onToggleFavorite,
}: {
  item: Property;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
}) => {
  const [isVisible, setVisible] = useState(false);
  const [message, setMessage] = useState("");
  const [localFavorite, setLocalFavorite] = useState(isFavorite);

  useEffect(() => {
    setLocalFavorite(isFavorite);
  }, [isFavorite]);

  const handleFavoritePress = () => {
    setLocalFavorite(!localFavorite);
    onToggleFavorite(item.id);
  };

  const handleSendMessage = (
    senderId: string,
    targetId: string,
    message: string,
    title: string,
  ) => {
    sendNewMessage(senderId, targetId, message, title);
    handleClosePopup();
  };

  const handleClosePopup = () => {
    setVisible(false);
    setMessage("");
  };

  return (
    <View>
      <Card style={styles.card} elevation={3}>
        <View style={styles.imageContainer}>
          <Card.Cover
            source={
              item.image
                ? { uri: item.image }
                : require("../assets/images/default-property.png")
            }
            style={styles.cardImage}
          />
          <IconButton
            icon={localFavorite ? "heart" : "heart-outline"}
            iconColor={localFavorite ? theme.colors.error : theme.colors.primary}
            size={24}
            style={styles.favoriteButton}
            onPress={handleFavoritePress}
          />
        </View>
        <Card.Content style={styles.cardContent}>
          <View style={styles.priceRow}>
            <Title style={styles.rent}>${item.rent}/mo</Title>
            <View style={styles.chatButtonWrapper}>
              <Surface style={styles.chatButtonSurface}>
                <Button
                  mode="contained"
                  icon="message-text"
                  onPress={() => setVisible(true)}
                  style={styles.chatButton}
                  contentStyle={styles.chatButtonContent}
                  labelStyle={styles.chatButtonLabel}
                >
                  Chat
                </Button>
              </Surface>
            </View>
          </View>
          <View style={styles.detailsContainer}>
            <Chip icon="bed" style={styles.chip}>
              {item.bedCount} beds
            </Chip>
            <Chip icon="shower" style={styles.chip}>
              {item.bathCount} baths
            </Chip>
            <Chip icon="ruler-square" style={styles.chip}>
              {item.area} sqft
            </Chip>
          </View>
          <Paragraph style={styles.address}>{item.address}</Paragraph>
          <Text style={styles.dates}>
            {new Date(item.startDate).toLocaleDateString()} -{" "}
            {new Date(item.endDate).toLocaleDateString()}
          </Text>
        </Card.Content>
      </Card>

      <Modal
        animationType="slide"
        transparent={true}
        visible={isVisible}
        onDismiss={() => setVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View>
            <Text style={styles.modalTitle}>Message the Subletter</Text>
            <TextInput
              style={styles.messageInput}
              placeholder="Your message here"
              value={message}
              onChangeText={setMessage}
            />
            <View>
              <Button
                mode="contained"
                textColor="#000000"
                onPress={() => {
                  handleSendMessage(
                    auth.currentUser?.uid || "",
                    item.authorId,
                    message,
                    item.address,
                  );
                }}
                style={{ marginBottom: 10 }}
              >
                Send
              </Button>
              <Button
                buttonColor="#ffffbb"
                textColor="#000000"
                onPress={handleClosePopup}
              >
                Cancel
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// FilterModal Component
const FilterModal = ({
  visible,
  hideModal,
  onApplyFilters,
}: {
  visible: boolean;
  hideModal: () => void;
  onApplyFilters: (filters: FilterOptions) => void;
}) => {
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [bedrooms, setBedrooms] = useState<string>("any");

  const handleApply = () => {
    const filters: FilterOptions = {};

    if (minPrice) {
      filters.minPrice = parseInt(minPrice, 10);
    }
    if (maxPrice) {
      filters.maxPrice = parseInt(maxPrice, 10);
    }
    if (bedrooms !== "any") {
      filters.bedrooms = parseInt(bedrooms, 10);
    }

    onApplyFilters(filters);
    hideModal();
  };

  const handleReset = () => {
    setMinPrice("");
    setMaxPrice("");
    setBedrooms("any");
    onApplyFilters({});
    hideModal();
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={hideModal}
        contentContainerStyle={styles.modalContainer}
      >
        <Title style={styles.modalTitle}>Filter Listings</Title>
        <Divider style={styles.divider} />

        <Text style={styles.filterLabel}>Price Range</Text>
        <View style={styles.priceInputs}>
          <Searchbar
            placeholder="Min $"
            value={minPrice}
            onChangeText={setMinPrice}
            style={styles.priceInput}
            keyboardType="numeric"
            icon="currency-usd"
          />
          <Text>-</Text>
          <Searchbar
            placeholder="Max $"
            value={maxPrice}
            onChangeText={setMaxPrice}
            style={styles.priceInput}
            keyboardType="numeric"
            icon="currency-usd"
          />
        </View>

        <Text style={styles.filterLabel}>Bedrooms</Text>
        <SegmentedButtons
          value={bedrooms}
          onValueChange={setBedrooms}
          buttons={[
            {
              value: "any",
              label: "Any",
              style: [
                styles.segmentedButton,
                bedrooms === "any" && styles.segmentedButtonSelected,
              ],
              labelStyle:
                bedrooms === "any"
                  ? styles.segmentedButtonTextSelected
                  : styles.segmentedButtonText,
            },
            {
              value: "1",
              label: "1+",
              style: [
                styles.segmentedButton,
                bedrooms === "1" && styles.segmentedButtonSelected,
              ],
              labelStyle:
                bedrooms === "1"
                  ? styles.segmentedButtonTextSelected
                  : styles.segmentedButtonText,
            },
            {
              value: "2",
              label: "2+",
              style: [
                styles.segmentedButton,
                bedrooms === "2" && styles.segmentedButtonSelected,
              ],
              labelStyle:
                bedrooms === "2"
                  ? styles.segmentedButtonTextSelected
                  : styles.segmentedButtonText,
            },
            {
              value: "3",
              label: "3+",
              style: [
                styles.segmentedButton,
                bedrooms === "3" && styles.segmentedButtonSelected,
              ],
              labelStyle:
                bedrooms === "3"
                  ? styles.segmentedButtonTextSelected
                  : styles.segmentedButtonText,
            },
          ]}
        />

        <View style={styles.modalActions}>
          <Button onPress={handleReset} buttonColor="#FFD70020" textColor="#000000">
            Reset
          </Button>
          <Button mode="contained" textColor="#000000" onPress={handleApply}>
            Apply Filters
          </Button>
        </View>
      </Modal>
    </Portal>
  );
};

// Main RentPage Component
export function RentPage() {
  const { user } = useAuth();
  const [data, setData] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [filterVisible, setFilterVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({});

  const fetchUserFavorites = async () => {
    if (!user) return;
    try {
      const userDoc = await getDoc(doc(firestore, "users", user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setFavorites(new Set(userData.interested_listing_ids || []));
      }
    } catch (error) {
      console.error("Error fetching user favorites:", error);
    }
  };

  const fetchData = async () => {
    try {
      const result = await getListings();
      const formattedData = await Promise.all(
        result.map(async (item: any) => {
          const coordinates = await getCoordinatesFromAddress(item.property);
          return {
            id: item.id,
            address: item.property,
            rent: item.rent,
            startDate: item.startDate,
            endDate: item.endDate,
            image: item.image,
            bedCount: item.bedCount,
            bathCount: item.bathCount,
            area: item.area,
            latitude: coordinates?.latitude,
            longitude: coordinates?.longitude,
            authorId: item.authorId,
          };
        })
      );
      setData(formattedData);
      await fetchUserFavorites();
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const toggleFavorite = async (id: string) => {
    if (!user) {
      Alert.alert("Error", "Please sign in to save listings");
      return;
    }

    try {
      const userRef = doc(firestore, "users", user.uid);
      const listingRef = doc(firestore, "listings", id);

      if (favorites.has(id)) {
        await updateDoc(userRef, {
          interested_listing_ids: arrayRemove(id)
        });
        await updateDoc(listingRef, {
          interested_user_ids: arrayRemove(user.uid)
        });
        setFavorites(prev => {
          const newFavorites = new Set(prev);
          newFavorites.delete(id);
          return newFavorites;
        });
      } else {
        await updateDoc(userRef, {
          interested_listing_ids: arrayUnion(id)
        });
        await updateDoc(listingRef, {
          interested_user_ids: arrayUnion(user.uid)
        });
        setFavorites(prev => {
          const newFavorites = new Set(prev);
          newFavorites.add(id);
          return newFavorites;
        });
      }
    } catch (error) {
      console.error("Error updating favorites:", error);
      Alert.alert("Error", "Failed to update favorites. Please try again.");
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchData();
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setRefreshing(false);
    }
  };

  // Filter the data based on search query and filter options
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      // Apply search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (!item.address.toLowerCase().includes(query)) {
          return false;
        }
      }

      // Apply price filters
      if (filterOptions.minPrice && item.rent < filterOptions.minPrice) {
        return false;
      }
      if (filterOptions.maxPrice && item.rent > filterOptions.maxPrice) {
        return false;
      }

      // Apply bedroom filter
      if (filterOptions.bedrooms && item.bedCount < filterOptions.bedrooms) {
        return false;
      }

      // Apply bathroom filter
      if (filterOptions.bathrooms && item.bathCount < filterOptions.bathrooms) {
        return false;
      }

      return true;
    });
  }, [data, filterOptions, searchQuery]);

  const renderContent = () => {
    if (viewMode === "map") {
      return (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: 34.4133,
            longitude: -119.8610,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        >
          {filteredData.map((item) => (
            <Marker
              key={item.id}
              coordinate={{
                latitude: item.latitude || 34.4133,
                longitude: item.longitude || -119.8610,
              }}
            >
              <Callout>
                <View style={{ width: 150, alignItems: "center", padding: 5 }}>
                  <View style={{ width: 100, height: 100 }}>
                    <Image
                      source={{
                        uri: item.image
                      }}
                      style={{ width: '100%', height: '100%' }}
                      resizeMode="cover"
                    />
                  </View>
                  <Text style={{ fontWeight: 'bold', marginTop: 5 }}>{item.address}</Text>
                  <Text>${item.rent}/month</Text>
                </View>
              </Callout>
            </Marker>
          ))}
        </MapView>
      );
    }

    return (
      <FlashList
        data={filteredData}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
        renderItem={({ item }) => (
          <PropertyCard
            item={item}
            isFavorite={favorites.has(item.id)}
            onToggleFavorite={toggleFavorite}
          />
        )}
        estimatedItemSize={350}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
      />
    );
  };

  if (loading) {
    return (
      <PaperProvider theme={theme}>
        <View style={[styles.container, styles.loadingContainer]}>
          <LoadingEgg size={80} />
        </View>
      </PaperProvider>
    );
  }

  return (
    <PaperProvider theme={theme}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Searchbar
            placeholder="Search by location..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchbar}
          />
          <IconButton
            icon="tune"
            size={24}
            onPress={() => setFilterVisible(true)}
          />
        </View>

        <SegmentedButtons
          value={viewMode}
          onValueChange={(value) => setViewMode(value as "list" | "map")}
          buttons={[
            {
              value: "list",
              icon: "view-list",
              label: "List",
              style: [
                styles.segmentedButton,
                viewMode === "list" && styles.segmentedButtonSelected,
              ],
              labelStyle:
                viewMode === "list"
                  ? styles.segmentedButtonTextSelected
                  : styles.segmentedButtonText,
            },
            {
              value: "map",
              icon: "map",
              label: "Map",
              style: [
                styles.segmentedButton,
                viewMode === "map" && styles.segmentedButtonSelected,
              ],
              labelStyle:
                viewMode === "map"
                  ? styles.segmentedButtonTextSelected
                  : styles.segmentedButtonText,
            },
          ]}
          style={styles.segmentedButtonsContainer}
        />

        {renderContent()}

        <FilterModal
          visible={filterVisible}
          hideModal={() => setFilterVisible(false)}
          onApplyFilters={setFilterOptions}
        />

        <FAB
          icon="tune"
          style={styles.fab}
          onPress={() => setFilterVisible(true)}
          label="Filter"
        />
      </View>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: theme.colors.surface,
  },
  searchbar: {
    flex: 1,
    marginRight: 8,
    backgroundColor: theme.colors.surface,
  },
  viewToggle: {
    margin: 16,
  },
  listContainer: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: theme.colors.primaryContainer,
    overflow: 'hidden',
  },
  imageContainer: {
    position: "relative",
  },
  cardImage: {
    height: 200,
  },
  favoriteButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: theme.colors.surface,
    opacity: 0.9,
  },
  cardContent: {
    padding: 16,
    backgroundColor: theme.colors.surface,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rent: {
    fontSize: 24,
    fontWeight: "bold",
    color: theme.colors.text,
  },
  detailsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },
  address: {
    marginTop: 8,
    fontSize: 16,
    color: theme.colors.text,
  },
  dates: {
    marginTop: 4,
    fontSize: 14,
    color: theme.colors.text + "99",
  },
  map: {
    flex: 1,
    height: Dimensions.get("window").height - 200,
  },
  modalContainer: {
    backgroundColor: theme.colors.surface,
    padding: 20,
    margin: 20,
    borderRadius: 12,
  },
  modalTitle: {
    textAlign: "center",
    marginBottom: 16,
  },
  divider: {
    marginVertical: 16,
  },
  filterLabel: {
    fontSize: 16,
    marginVertical: 8,
  },
  priceInputs: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  priceInput: {
    flex: 1,
    height: 40,
    backgroundColor: theme.colors.primaryContainer,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
    marginTop: 16,
  },
  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.primary,
  },
  messageButton: {
    backgroundColor: theme.colors.secondary + "20",
  },
  messageInput: {
    marginBottom: 10,
  },
  chatButtonContainer: {
    elevation: 4,
    borderRadius: 20,
    overflow: "hidden",
  },
  chatButtonWrapper: {
    overflow: "hidden",
    borderRadius: 20,
  },
  chatButtonSurface: {
    elevation: 4,
    borderRadius: 20,
  },
  chatButton: {
    backgroundColor: theme.colors.chatButton,
    borderRadius: 20,
    paddingHorizontal: 16,
  },
  chatButtonContent: {
    flexDirection: "row-reverse",
    height: 36,
  },
  chatButtonLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 4,
    color: '#000000',
  },
  chip: {
    backgroundColor: theme.colors.primary + "20",
  },
  chipText: {
    color: theme.colors.text,
  },
  segmentedButtonsContainer: {
    backgroundColor: theme.colors.primaryContainer,
    borderRadius: 8,
    margin: 16,
  },
  segmentedButton: {
    backgroundColor: "transparent",
  },
  segmentedButtonSelected: {
    backgroundColor: theme.colors.primary,
  },
  segmentedButtonText: {
    color: theme.colors.text,
  },
  segmentedButtonTextSelected: {
    color: theme.colors.onPrimaryContainer,
  },
  segmentedButtonBackground: {
    backgroundColor: theme.colors.primaryContainer,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});