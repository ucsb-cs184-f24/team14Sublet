import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

// Mock data for leases
const leases = [
  { id: '1', property: '123 Main St', rent: 1200, startDate: '2023-09-01', endDate: '2024-08-31' },
  { id: '2', property: '456 Elm St', rent: 1500, startDate: '2023-10-01', endDate: '2024-09-30' },
  { id: '3', property: '789 Oak Ave', rent: 1100, startDate: '2023-11-01', endDate: '2024-10-31' },
  // Add more mock data as needed
];

// Lease item component
const LeaseItem = ({ item }) => (
  <ThemedView style={styles.leaseItem}>
    <ThemedText style={styles.propertyName}>{item.property}</ThemedText>
    <ThemedText>Rent: ${item.rent}/month</ThemedText>
    <ThemedText>Start Date: {item.startDate}</ThemedText>
    <ThemedText>End Date: {item.endDate}</ThemedText>
  </ThemedView>
);

export function RentPage() {
  return (
    <View style={styles.container}>
      <ThemedText style={styles.title}>Your Leases</ThemedText>
      <FlatList
        data={leases}
        renderItem={({ item }) => <LeaseItem item={item} />}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  listContainer: {
    paddingBottom: 20,
  },
  leaseItem: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  propertyName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
});
