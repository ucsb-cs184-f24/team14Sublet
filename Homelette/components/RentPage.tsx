import React, { useState, useEffect, useMemo } from "react";
import { StyleSheet, View, Dimensions } from "react-native";
import { getListings, auth, sendNewMessage } from "@/config/firebase";
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

// Custom theme for React Native Paper
const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
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

// PropertyCard Component
const PropertyCard = ({
  item,
  isFavorite,
  listingAuthorId,
  onToggleFavorite,
}: {
  item: Property;
  isFavorite: boolean;
  listingAuthorId: string;
  onToggleFavorite: (id: string) => void;
}) => {
  const [isVisible, setVisible] = useState(false);
  const [message, setMessage] = useState("");

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
            />
            <View>
              <Button
                mode="contained"
                textColor="#000000"
                onPress={() => {
                  handleSendMessage(
                    auth.currentUser?.uid || "",
                    listingAuthorId,
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
interface FilterModalProps {
  visible: boolean;
  hideModal: () => void;
  onApplyFilters: (filters: FilterOptions) => void;
}

const FilterModal = ({
  visible,
  hideModal,
  onApplyFilters,
}: FilterModalProps) => {
  // State for min and max price inputs
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  // State for bedrooms
  const [bedrooms, setBedrooms] = useState<string>("any");

  // You can add more states for bathrooms, startDate, etc., if needed

  const handleApply = () => {
    const filters: FilterOptions = {};

    if (minPrice) {
      const parsedMin = parseInt(minPrice, 10);
      if (!isNaN(parsedMin)) {
        filters.minPrice = parsedMin;
      }
    }

    if (maxPrice) {
      const parsedMax = parseInt(maxPrice, 10);
      if (!isNaN(parsedMax)) {
        filters.maxPrice = parsedMax;
      }
    }

    if (bedrooms !== "any") {
      const parsedBedrooms = parseInt(bedrooms, 10);
      if (!isNaN(parsedBedrooms)) {
        filters.bedrooms = parsedBedrooms;
      }
    }

    // Similarly, add other filters like bathrooms, startDate, etc.

    onApplyFilters(filters);
    hideModal();
  };

  const handleReset = () => {
    setMinPrice("");
    setMaxPrice("");
    setBedrooms("any");
    // Reset other filters if added

    onApplyFilters({}); // Pass empty filters to reset
    hideModal();
  };

  const bedroomButtons = [
    {
      value: "any",
      label: "Any",
      style: bedrooms === "any" ? styles.segmentedButtonSelected : styles.segmentedButton,
      labelStyle: bedrooms === "any" ? styles.segmentedButtonTextSelected : styles.segmentedButtonText,
    },
    {
      value: "1",
      label: "1+",
      style: bedrooms === "1" ? styles.segmentedButtonSelected : styles.segmentedButton,
      labelStyle: bedrooms === "1" ? styles.segmentedButtonTextSelected : styles.segmentedButtonText,
    },
    {
      value: "2",
      label: "2+",
      style: bedrooms === "2" ? styles.segmentedButtonSelected : styles.segmentedButton,
      labelStyle: bedrooms === "2" ? styles.segmentedButtonTextSelected : styles.segmentedButtonText,
    },
    {
      value: "3",
      label: "3+",
      style: bedrooms === "3" ? styles.segmentedButtonSelected : styles.segmentedButton,
      labelStyle: bedrooms === "3" ? styles.segmentedButtonTextSelected : styles.segmentedButtonText,
    },
  ];

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
          onValueChange={(value) => setBedrooms(value)}
          buttons={bedroomButtons}
        />

        {/* Add more filter options here (e.g., Bathrooms, Start Date) if needed */}

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

// RentPage Component
export function RentPage() {
  const [data, setData] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [filterVisible, setFilterVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // New state for filter options
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    minPrice: undefined,
    maxPrice: undefined,
    bedrooms: undefined,
    bathrooms: undefined,
    startDate: undefined,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getListings();

        // Map the data to match the Property type
        const formattedData = result.map((item: any) => ({
          id: item.id,
          address: item.property, // Rename property to address
          rent: item.rent,
          startDate: item.startDate,
          endDate: item.endDate,
          image: item.image,
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
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(id)) {
        newFavorites.delete(id);
      } else {
        newFavorites.add(id);
      }
      return newFavorites;
    });
  };

  // Function to handle applying filters
  const handleApplyFilters = (filters: FilterOptions) => {
    setFilterOptions(filters);
  };

  // Compute filtered data based on filterOptions and searchQuery
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      // Apply search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (!item.address.toLowerCase().includes(query)) {
          return false;
        }
      }

      // Apply minPrice
      if (
        filterOptions.minPrice !== undefined &&
        item.rent < filterOptions.minPrice
      ) {
        return false;
      }

      // Apply maxPrice
      if (
        filterOptions.maxPrice !== undefined &&
        item.rent > filterOptions.maxPrice
      ) {
        return false;
      }

      // Apply bedrooms
      if (
        filterOptions.bedrooms !== undefined &&
        item.bedCount < filterOptions.bedrooms
      ) {
        return false;
      }

      // Apply bathrooms (if needed)
      if (
        filterOptions.bathrooms !== undefined &&
        item.bathCount < filterOptions.bathrooms
      ) {
        return false;
      }

      // Apply startDate (if needed)
      if (filterOptions.startDate) {
        const itemStartDate = new Date(item.startDate);
        if (itemStartDate < filterOptions.startDate) {
          return false;
        }
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
            latitude: 37.78825,
            longitude: -122.4324,
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
            listingAuthorId={item.authorId}
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
        <Card style={styles.card} elevation={2}>
          <Card.Content>
            <View>
              <Title style={styles.rent}>Loading...</Title>
            </View>
          </Card.Content>
        </Card>
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
          onApplyFilters={handleApplyFilters}
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

// Styles
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
    flexDirection: "row-reverse", // Places icon after text
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
    backgroundColor: theme.colors.primaryContainer, // Background for the toggle buttons
    borderRadius: 8,
    margin: 16,
  },
  segmentedButton: {
    backgroundColor: theme.colors.primaryContainer,
  },
  segmentedButtonSelected: {
    backgroundColor: theme.colors.primary,
  },
  segmentedButtonText: {
    color: theme.colors.text,
  },
  segmentedButtonTextSelected: {
    color: theme.colors.text,
  },
  segmentedButtonBackground: {
    backgroundColor: theme.colors.primaryContainer, // Custom background for segmented buttons
  },
});
