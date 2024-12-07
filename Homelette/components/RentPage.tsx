import React, { useState, useEffect } from "react";
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
import axios from "axios";

// Mock data for properties

/* // - don't need this mock data
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
*/

// helper function to get longitude / latitude:

const getCoordinatesFromAddress = async (address: string): Promise<{latitude: number, longitude: number} | null> => {
  const apiKey = "AIzaSyCVsuSPlVbAHwQNkMS6ui8Pni2NJQ_UMb8"; // Replace with your Google API key
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;
  
  try {
    const response = await axios.get(url);
    if (response.data.status === "OK") {
      const { lat, lng } = response.data.results[0].geometry.location;
      return { latitude: lat, longitude: lng };
    } else {
      console.error("Geocoding failed: ", response.data.status);
      return null;
    }
  } catch (error) {
    console.error("Error fetching geocoding data:", error);
    return null;
  }
};

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
                    auth.currentUser?.uid,
                    item.authorId,
                    message,
                    item.address,
                  );
                }}
                style={{ marginBottom: 10 }}
              >
                Send
              </Button>
              <Button buttonColor="#ffffbb" textColor="#000000" onPress={() => handleClosePopup()}>
                Cancel
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

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
          <Button onPress={hideModal} buttonColor="#FFD70020" textColor="#000000">Reset</Button>
          <Button mode="contained" textColor="#000000" onPress={onApplyFilters}>
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
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [filterVisible, setFilterVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchData = async () => { // this is getting the data for me
      try {
        const result = await getListings();

        // Map the data to match the Property type
        const formattedData: Property[] = await Promise.all(
          result.map(async (item: any): Promise<Property> => {
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
              latitude: coordinates?.latitude ,
              longitude: coordinates?.longitude ,
              authorId: item.authorId,
            };
          })
        );
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
          {data.map((item) => (
            <Marker
              key={item.id}
              coordinate={{
                latitude: item.latitude,
                longitude: item.longitude,
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
    flexDirection: "row-reverse", // Places icon after text
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
