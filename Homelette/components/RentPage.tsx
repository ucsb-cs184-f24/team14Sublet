import React, { useState, useEffect } from "react";
import { StyleSheet, View, Dimensions, Alert } from "react-native";
import {
  getListings,
  auth,
  sendNewMessage,
  firestore,
  addListingToInterested,
  removeListingFromInterested,
} from "@/config/firebase"; // Ensure correct path
import MapView, { Marker } from "react-native-maps";
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
import { doc, getDoc, collection, getDocs, addDoc } from "firebase/firestore"; // Ensure correct imports

// Custom Theme for React Native Paper
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

// Type Definitions
interface Property {
  id: string;
  address: string;
  rent: number;
  startDate: string;
  endDate: string;
  image: any; // Adjusted to 'any' to accommodate require statements or URI strings
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

interface FilterModalProps {
  visible: boolean;
  hideModal: () => void;
  onApplyFilters: (filters: FilterOptions) => void;
}

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

  const handleSendMessage = async (
    senderId: string,
    targetId: string,
    message: string,
    title: string
  ) => {
    try {
      await sendNewMessage(senderId, targetId, message, title);
      Alert.alert("Success", "Your message has been sent.");
      handleClosePopup();
    } catch (error) {
      console.error("Error sending message:", error);
      Alert.alert("Error", "Failed to send your message. Please try again.");
    }
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
                ? typeof item.image === "string"
                  ? { uri: item.image }
                  : item.image
                : require("../assets/images/default-property.png")
            }
            style={styles.cardImage}
          />
          <IconButton
            icon={isFavorite ? "heart" : "heart-outline"}
            iconColor={isFavorite ? theme.colors.error : theme.colors.primary}
            size={24}
            style={styles.favoriteButton}
            onPress={() => onToggleFavorite(item.id)}
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

      {/* Message Modal */}
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
              placeholder={`Your message here`}
              value={message}
              onChangeText={setMessage}
              multiline
            />
            <View>
              <Button
                mode="contained"
                textColor="#000000"
                onPress={() => {
                  if (message.trim() === "") {
                    Alert.alert("Error", "Message cannot be empty.");
                    return;
                  }
                  handleSendMessage(
                    auth.currentUser?.uid || "",
                    item.authorId,
                    message,
                    item.address
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
}: FilterModalProps) => {
  // State for min and max price inputs
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [bedrooms, setBedrooms] = useState("any");

  const applyFilters = () => {
    const filters: FilterOptions = {};
    if (minPrice) filters.minPrice = parseInt(minPrice);
    if (maxPrice) filters.maxPrice = parseInt(maxPrice);
    if (bedrooms !== "any") filters.bedrooms = parseInt(bedrooms);
    onApplyFilters(filters);
    hideModal();
  };

  const resetFilters = () => {
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
          />
          <Text>-</Text>
          <Searchbar
            placeholder="Max $"
            value={maxPrice}
            onChangeText={setMaxPrice}
            style={styles.priceInput}
            keyboardType="numeric"
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
              style: styles.segmentedButtonBackground,
            },
            {
              value: "1",
              label: "1+",
              style: styles.segmentedButtonBackground,
            },
            {
              value: "2",
              label: "2+",
              style: styles.segmentedButtonBackground,
            },
            {
              value: "3",
              label: "3+",
              style: styles.segmentedButtonBackground,
            },
          ]}
          style={styles.segmentedButtonsContainer}
        />

        <View style={styles.modalActions}>
          <Button
            onPress={resetFilters}
            buttonColor="#FFD70020"
            textColor="#000000"
          >
            Reset
          </Button>
          <Button mode="contained" textColor="#000000" onPress={applyFilters}>
            Apply Filters
          </Button>
        </View>
      </Modal>
    </Portal>
  );
};

// RentPage Component
export function RentPage() {
  const [data, setData] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [filterVisible, setFilterVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<FilterOptions>({});

  // Fetch Listings Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getListings();

        // Map the data to match the Property type
        const formattedData: Property[] = result.map((item: any) => ({
          id: item.id,
          address: item.property, // Rename property to address
          rent: item.rent,
          startDate: item.startDate,
          endDate: item.endDate,
          image: item.image, // Ensure this is a URI string or a require statement
          bedCount: item.bedCount,
          bathCount: item.bathCount,
          area: item.area,
          latitude: item.latitude,
          longitude: item.longitude,
          authorId: item.authorId,
        }));

        setData(formattedData);
      } catch (error) {
        console.error("Error fetching data:", error);
        Alert.alert("Error", "Failed to fetch listings. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Fetch Initial Favorites from Firestore
  useEffect(() => {
    const fetchFavorites = async () => {
      if (auth.currentUser?.uid) {
        try {
          const userRef = doc(firestore, "users", auth.currentUser.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const favoritesArray: string[] =
              userSnap.data().interested_listing_ids || [];
            setFavorites(new Set(favoritesArray));
          }
        } catch (error) {
          console.error("Error fetching favorites:", error);
          Alert.alert(
            "Error",
            "Failed to fetch your favorites. Please try again."
          );
        }
      }
    };
    fetchFavorites();
  }, []);

  // Toggle Favorite Function with Optimistic UI Update
  const toggleFavorite = async (id: string) => {
    if (!auth.currentUser?.uid) {
      Alert.alert("Authentication Required", "Please log in to manage favorites.");
      return;
    }

    // Optimistically update the favorites state
    setFavorites((prev) => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(id)) {
        newFavorites.delete(id);
      } else {
        newFavorites.add(id);
      }
      return newFavorites;
    });

    try {
      if (favorites.has(id)) {
        await removeListingFromInterested(auth.currentUser.uid, id);
      } else {
        await addListingToInterested(auth.currentUser.uid, id);
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      Alert.alert(
        "Error",
        "Failed to update favorites. Please try again."
      );
      // Revert the optimistic update in case of error
      setFavorites((prev) => {
        const revertedFavorites = new Set(prev);
        if (revertedFavorites.has(id)) {
          revertedFavorites.delete(id);
        } else {
          revertedFavorites.add(id);
        }
        return revertedFavorites;
      });
    }
  };

  // Apply Filters Function
  const applyFilters = (appliedFilters: FilterOptions) => {
    setFilters(appliedFilters);
  };

  // Filtered and Searched Data
  const filteredData = data.filter((item) => {
    // Search Query Filter
    const matchesSearch = item.address
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    // Price Range Filter
    const withinMinPrice =
      filters.minPrice !== undefined ? item.rent >= filters.minPrice : true;
    const withinMaxPrice =
      filters.maxPrice !== undefined ? item.rent <= filters.maxPrice : true;

    // Bedrooms Filter
    const meetsBedrooms =
      filters.bedrooms !== undefined
        ? item.bedCount >= filters.bedrooms
        : true;

    return matchesSearch && withinMinPrice && withinMaxPrice && meetsBedrooms;
  });

  // Render Content Based on View Mode
  const renderContent = () => {
    if (viewMode === "map") {
      return (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude:
              filteredData.length > 0
                ? filteredData[0].latitude || 37.78825
                : 37.78825,
            longitude:
              filteredData.length > 0
                ? filteredData[0].longitude || -122.4324
                : -122.4324,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        >
          {filteredData.map((item) => (
            <Marker
              key={item.id}
              coordinate={{
                latitude: item.latitude || 37.78825,
                longitude: item.longitude || -122.4324,
              }}
              title={item.address}
              description={`$${item.rent}/month`}
            />
          ))}
        </MapView>
      );
    }

    return (
      <FlashList
        data={filteredData}
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

  // Loading State
  if (loading) {
    return (
      <PaperProvider theme={theme}>
        <View style={styles.loadingContainer}>
          <Title style={styles.rent}>Loading...</Title>
        </View>
      </PaperProvider>
    );
  }

  return (
    <PaperProvider theme={theme}>
      <View style={styles.container}>
        {/* Header with Searchbar and Filter Icon */}
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

        {/* View Mode Segmented Buttons */}
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

        {/* Main Content */}
        {renderContent()}

        {/* Filter Modal */}
        <FilterModal
          visible={filterVisible}
          hideModal={() => setFilterVisible(false)}
          onApplyFilters={applyFilters}
        />

        {/* Floating Action Button for Filters (Optional) */}
        {/* Uncomment the FAB if you prefer using it for filters */}
        {/* <FAB
          icon="tune"
          style={styles.fab}
          onPress={() => setFilterVisible(true)}
          label="Filter"
        /> */}
      </View>
    </PaperProvider>
  );
}

// Stylesheet
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContainer: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: theme.colors.primaryContainer,
    overflow: "hidden",
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
    fontSize: 20,
    fontWeight: "bold",
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
    backgroundColor: theme.colors.surface,
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
    color: "#000000",
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
});
