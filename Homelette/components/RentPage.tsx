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
import { DefaultTheme } from 'react-native-paper';


const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#FFD700', // Main yellow
    secondary: '#2E3192', // Accent blue
    surface: '#FFFFFF',
    background: '#F5F5F5',
    error: '#FF6B6B',
    text: '#333333',
    accent: '#2E3192', // Using deep blue as accent
    chatButton: '#2E3192', // Deep blue for chat button
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
  onToggleFavorite 
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
        onPress={() => onToggleFavorite(item.id)}
      />
    </View>
    <Card.Content style={styles.cardContent}>
      <View style={styles.priceRow}>
        <Title style={styles.rent}>${item.rent}/mo</Title>
        <Surface style={styles.chatButtonContainer}>
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
      <View style={styles.detailsContainer}>
        <Chip icon="bed" style={styles.chip}>{item.bedCount} beds</Chip>
        <Chip icon="shower" style={styles.chip}>{item.bathCount} baths</Chip>
        <Chip icon="ruler-square" style={styles.chip}>{item.area} sqft</Chip>
      </View>
      <Paragraph style={styles.address}>{item.address}</Paragraph>
      <Text style={styles.dates}>
        {new Date(item.startDate).toLocaleDateString()} - {new Date(item.endDate).toLocaleDateString()}
      </Text>
    </Card.Content>
  </Card>
);

const FilterModal = ({ visible, hideModal, onApplyFilters }) => (
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
          style={styles.priceInput}
          keyboardType="numeric"
        />
        <Text>-</Text>
        <Searchbar
          placeholder="Max $"
          style={styles.priceInput}
          keyboardType="numeric"
        />
      </View>

      <Text style={styles.filterLabel}>Bedrooms</Text>
      <SegmentedButtons
        value="any"
        onValueChange={() => {}}
        buttons={[
          { value: 'any', label: 'Any' },
          { value: '1', label: '1+' },
          { value: '2', label: '2+' },
          { value: '3', label: '3+' },
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

export function RentPage() {
  const [data, setData] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [filterVisible, setFilterVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getListings();
        setData(result);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const toggleFavorite = (id: string) => {
    setFavorites(prev => {
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
    if (viewMode === 'map') {
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
          onValueChange={value => setViewMode(value as 'list' | 'map')}
          buttons={[
            { value: 'list', icon: 'view-list', label: 'List' },
            { value: 'map', icon: 'map', label: 'Map' },
          ]}
          style={styles.viewToggle}
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
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: theme.colors.surface,
  },
  searchbar: {
    flex: 1,
    marginRight: 8,
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
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
  },
  cardImage: {
    height: 200,
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  cardContent: {
    padding: 16,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rent: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  detailsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  chip: {
    backgroundColor: theme.colors.primary + '20',
  },
  address: {
    marginTop: 8,
    fontSize: 16,
    color: theme.colors.text,
  },
  dates: {
    marginTop: 4,
    fontSize: 14,
    color: theme.colors.text + '99',
  },
  map: {
    flex: 1,
    height: Dimensions.get('window').height - 200,
  },
  modalContainer: {
    backgroundColor: theme.colors.surface,
    padding: 20,
    margin: 20,
    borderRadius: 12,
  },
  modalTitle: {
    textAlign: 'center',
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  priceInput: {
    flex: 1,
    height: 40,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 16,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.primary,
  },
  messageButton: {
    backgroundColor: theme.colors.secondary + '20',
  },
  chatButtonContainer: {
    elevation: 4,
    borderRadius: 20,
    overflow: 'hidden',
  },
  chatButton: {
    backgroundColor: theme.colors.chatButton,
    borderRadius: 20,
    paddingHorizontal: 16,
  },
  chatButtonContent: {
    flexDirection: 'row-reverse', // Places icon after text
    height: 36,
  },
  chatButtonLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  chip: {
    backgroundColor: theme.colors.primary + '20',
  },
  chipText: {
    color: theme.colors.secondary,
  },
});