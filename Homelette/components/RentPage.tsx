import React from "react";
import { StyleSheet, FlatList, View } from "react-native";
import {
  Card,
  Title,
  Paragraph,
  Text,
  Provider as PaperProvider,
  DefaultTheme,
  IconButton,
} from "react-native-paper";
import { ImageUploader } from './ImageUploader';

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
    primary: "#006aff",
    accent: "#03dac4",
  },
};

const PropertyCard = ({ item }) => (
  <Card style={styles.card} elevation={2}>
    <Card.Cover source={item.image} style={styles.cardImage} />
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
  return (
    <PaperProvider theme={theme}>
      <ImageUploader />
      <FlatList
        style={styles.container}
        data={leases}
        renderItem={({ item }) => <PropertyCard item={item} />}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
      />
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
  imageContainer: {
    position: "relative",
  },
  cardImage: {
    height: 200,
  },
  // messageIcon: {
  //   position: "absolute",
  //   bottom: -90,
  //   right: 25,
  //   backgroundColor: "lightblue",
  //   borderRadius: 25,
  //   elevation: 4,
  // },
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
});
