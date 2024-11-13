import React, { useState, useEffect } from "react";
import { StyleSheet, FlatList, View } from "react-native";
import { getListings } from "@/config/firebase";
import {
  Card,
  Title,
  Paragraph,
  Text,
  Provider as PaperProvider,
  DefaultTheme,
  IconButton,
} from "react-native-paper";
import MapView, { Marker } from "react-native-maps";

// Mock data for properties
const leases = [
  {
    id: "1",
    address: "123 Main St",
    rent: 1200,
    startDate: "2023-09-04",
    endDate: "2024-08-31",
    location: { latitude: 37.7749, longitude: -122.4194 }, // Sample coordinates
    bedCount: 3,
    bathCount: 2,
    area: 900,
  },
  // Add more mock leases with location coordinates as needed
];

// Custom theme for React Native Paper
const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: "#006aff",
    accent: "#03dac4",
  },
};

const PropertyCard = ({ item }) => (
  <Card style={styles.card} elevation={2}>
    <Card.Cover source={{ uri: item.image }} style={styles.cardImage} />
    <Card.Content>
      <View style={styles.contentContainer}>
        <View style={styles.propertyDetailsContainer}>
          <Title style={styles.rent}>${item.rent}/mo</Title>
          <Paragraph style={styles.propertyDetails}>
            <Text style={styles.boldText}>{item.bedCount}</Text> bed |{" "}
            <Text style={styles.boldText}>{item.bathCount}</Text> ba |{" "}
            <Text style={styles.boldText}>{item.area}</Text> sqft
          </Paragraph>
          <Paragraph style={styles.term}>
            Term: {new Date(item.startDate).toLocaleDateString()} -{" "}
            {new Date(item.endDate).toLocaleDateString()}
          </Paragraph>
          <Paragraph style={styles.address}>{item.address}</Paragraph>
        </View>
        <IconButton
          icon="message"
          size={30}
          iconColor="white"
          style={styles.messageIcon}
          onPress={() => {
            console.log("Message button pressed");
          }}
        />
      </View>
    </Card.Content>
  </Card>
);

export function RentPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

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

  if (loading) {
    return (
      <PaperProvider theme={theme}>
        <Card style={styles.card} elevation={2}>
          <Card.Content>
            <View style={styles.contentContainer}>
              <View style={styles.propertyDetailsContainer}>
                <Title style={styles.rent}>Loading...</Title>
              </View>
            </View>
          </Card.Content>
        </Card>
      </PaperProvider>
    );
  }

  return (
    <PaperProvider theme={theme}>
      <IconButton
        icon={viewMode === 'map' ? 'format-list-bulleted' : 'map'}
        size={30}
        onPress={() => setViewMode(viewMode === 'map' ? 'list' : 'map')}
        style={styles.toggleButton}
      />

      {viewMode === 'map' ? (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: 37.7749, // Default location (San Francisco)
            longitude: -122.4194,
            latitudeDelta: 0.1,
            longitudeDelta: 0.1,
          }}
        >
          {leases.map((lease) => (
            <Marker
              key={lease.id}
              coordinate={lease.location}
              title={lease.address}
              description={`$${lease.rent}/mo - ${lease.bedCount} bed, ${lease.bathCount} ba`}
            />
          ))}
        </MapView>
      ) : (
        <FlatList
          style={styles.container}
          data={data}
          renderItem={({ item }) => <PropertyCard item={item} />}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: "#f6f6f6",
  },
  listContainer: {
    paddingBottom: 20,
  },
  card: {
    marginBottom: 15,
    borderRadius: 10,
    overflow: "hidden",
  },
  boldText: {
    fontWeight: "600",
  },
  cardImage: {
    height: 200,
  },
  rent: {
    fontSize: 20,
    color: "black",
    fontWeight: "700",
    marginVertical: 5,
  },
  propertyDetails: {
    fontSize: 16,
    color: "#444",
    marginTop: 5,
  },
  term: {
    fontSize: 14,
    color: "#444",
  },
  address: {
    fontSize: 14,
  },
  contentContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  propertyDetailsContainer: {
    flex: 1,
  },
  messageIcon: {
    backgroundColor: "lightblue",
    borderRadius: 25,
    elevation: 4,
    marginLeft: 10,
  },
  toggleButton: {
    alignSelf: 'center',
    margin: 10,
  },
  map: {
    width: '100%',
    height: '85%',
  },
});
