import React, { useState, useEffect } from "react";
import { StyleSheet, View, Dimensions } from "react-native";
import { getListings } from "@/config/firebase";
import MapView, { Marker } from 'react-native-maps';
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
} from "react-native-paper";
import { FlashList } from "@shopify/flash-list";

// Mock data for properties
const leases = [
  {
    id: "1",
    address: "123 Main St",
    rent: 1200,
    startDate: "2023-09-04",
    endDate: "2024-08-31",
    image: require("../assets/images/mock_property_images/123-Main-St.jpg"),
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
    image: require("../assets/images/mock_property_images/456-Elm-St.jpg"),
    bedCount: 4,
    bathCount: 3,
    area: 1400,
  },
  {
    id: "3",
    address: "789 Oak Ave",
    rent: 1100,
    startDate: "2023-11-01",
    endDate: "2024-10-31",
    image: require("../assets/images/mock_property_images/789-Oak-Ave.jpg"),
    bedCount: 2,
    bathCount: 1,
    area: 900,
  },
];

// Custom theme for React Native Paper
const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#FFD700', // Main yellow for buttons and primary elements
    secondary: '#2E3192', // Accent blue for interactive elements
    surface: '#FFFFFC', // White for cards and surfaces
    background: '#F5F5F5', // Light gray for app background
    error: '#FF6B6B', // Red for error messages
    text: '#333333', // Dark gray for general text
    primaryContainer: '#FFD70020', // Light yellow background for buttons and containers
    onPrimaryContainer: '#0D1321', // Rich black for text/icons on primary containers
    chatButton: '#FFD700', // Yellow for the chat button
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
}

interface FilterOptions {
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  startDate?: Date;
}

const PropertyCard = ({
  item,
  isFavorite,
  onToggleFavorite,
}: {
  item: Property;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
}) => (
  <Card style={styles.card} elevation={3}>
    <View style={styles.imageContainer}>
      <Card.Cover source={{ uri: item.image }} style={styles.cardImage} />
      <IconButton
        icon={isFavorite ? "heart" : "heart-outline"}
        iconColor={isFavorite ? theme.colors.error : theme.colors.primary}
        size={24}
        style={styles.favoriteButton}
        onPress={() => {
          console.log("Favorite button pressed for id:", item.id);
          onToggleFavorite(item.id);
        }}
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
              onPress={() => console.log("Chat initiated")}
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
);

interface FilterModalProps {
  visible: boolean;
  hideModal: () => void;
  onApplyFilters: () => void;
}

const FilterModal = ({
  visible,
  hideModal,
  onApplyFilters,
}: FilterModalProps) => {
  // State for min and max price inputs
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

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
            value={minPrice} // Added value prop
            onChangeText={setMinPrice} // Added onChangeText handler
            style={styles.priceInput}
            keyboardType="numeric"
          />
          <Text>-</Text>
          <Searchbar
            placeholder="Max $"
            value={maxPrice} // Added value prop
            onChangeText={setMaxPrice} // Added onChangeText handler
            style={styles.priceInput}
            keyboardType="numeric"
          />
        </View>

        <Text style={styles.filterLabel}>Bedrooms</Text>
        <SegmentedButtons
          value="any"
          onValueChange={(value) => console.log(value)}
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
        />

        <View style={styles.modalActions}>
          <Button onPress={hideModal}>Reset</Button>
          <Button mode="contained" onPress={onApplyFilters}>
            Apply Filters
          </Button>
        </View>
      </Modal>
    </Portal>
  );
};

export function RentPage() {
  const [data, setData] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"list" | "map">("list");

  // Changed favorites state to an array
  const [favorites, setFavorites] = useState<string[]>([]);

  const [filterVisible, setFilterVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

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

  // Updated toggleFavorite function
  const toggleFavorite = (id: string) => {
    console.log("Toggling favorite for id:", id);
    setFavorites((prevFavorites) => {
      if (prevFavorites.includes(id)) {
        console.log("Removing from favorites:", id);
        return prevFavorites.filter((favId) => favId !== id);
      } else {
        console.log("Adding to favorites:", id);
        return [...prevFavorites, id];
      }
    });
  };

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
          {data.map((item) => (
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
        data={data}
        renderItem={({ item }) => (
          <PropertyCard
            item={item}
            isFavorite={favorites.includes(item.id)} // Updated this line
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
                viewMode === "list" && styles.segmentedButtonSelected, // Apply selected style
              ],
              labelStyle:
                viewMode === "list"
                  ? styles.segmentedButtonTextSelected
                  : styles.segmentedButtonText, // Conditionally apply text color
            },
            {
              value: "map",
              icon: "map",
              label: "Map",
              style: [
                styles.segmentedButton,
                viewMode === "map" && styles.segmentedButtonSelected, // Apply selected style
              ],
              labelStyle:
                viewMode === "map"
                  ? styles.segmentedButtonTextSelected
                  : styles.segmentedButtonText, // Conditionally apply text color
            },
          ]}
          style={styles.segmentedButtonsContainer}
        />

        {renderContent()}

        <FilterModal
          visible={filterVisible}
          hideModal={() => setFilterVisible(false)}
          onApplyFilters={() => {
            setFilterVisible(false);
            // Apply filters logic here
          }}
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
    backgroundColor: "transparent", // Keeps individual buttons transparent, showing the container's color
  },
  segmentedButtonSelected: {
    backgroundColor: theme.colors.primary, // Selected button background
  },
  segmentedButtonText: {
    color: theme.colors.text, // Unselected button text color
  },
  segmentedButtonTextSelected: {
    color: theme.colors.onPrimaryContainer, // Selected button text color
  },
  segmentedButtonBackground: {
    backgroundColor: theme.colors.primaryContainer, // Custom background for segmented buttons
  },
});
