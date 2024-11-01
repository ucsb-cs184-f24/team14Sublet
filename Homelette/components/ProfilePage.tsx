import React from 'react';
import { useState, useEffect } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Card, Title, Paragraph, Button } from 'react-native-paper';
import { ThemedText } from './ThemedText';
import { firestore } from '../config/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useAuth } from '@/hooks/useAuth';

// Mock user profile data
const mockUserProfile = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@ucsb.edu',
  joinDate: 'March 2024',
  school: 'UC Santa Barbara',
  major: 'Computer Science',
  graduationYear: '2025',
  bio: 'Looking for housing near UCSB campus. Clean, quiet, and responsible tenant.',
  listings: 2,
  reviews: 4.5,
};

export function ProfilePage() {

    const { user } = useAuth();
    const [userData, setUserData] = useState<any>(null);

    useEffect(() => {const fetchUserData = async () => {
        if (user) {
          const userDocRef = doc(firestore, 'users', user.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            setUserData(userData);
            console.log(userData);
          } else {
            console.log('No such document!');
          }
        }
      };
  
      fetchUserData();
    }, [user]);

  return (
    <View style={styles.container}>
      <Card style={styles.profileCard}>
        <View style={styles.headerSection}>
          <Image
            source={{ uri: 'https://via.placeholder.com/100' }}
            style={styles.profileImage}
          />
          <View style={styles.headerInfo}>
            <Title>{`${userData?.first} ${userData?.last}`}</Title>
            <Paragraph>{mockUserProfile.school}</Paragraph>
          </View>
        </View>

        <Card.Content>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <ThemedText type="title">{userData?.listing_ids?.length}</ThemedText>
              <ThemedText>Listings</ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText type="title">{userData?.interested_listing_ids?.length}</ThemedText>
              <ThemedText>Interested In</ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText type="title">{mockUserProfile.reviews}</ThemedText>
              <ThemedText>Rating</ThemedText>
            </View>
          </View>

          <View style={styles.infoSection}>
            <ThemedText type="subtitle">About Me</ThemedText>
            <ThemedText>{mockUserProfile.bio}</ThemedText>
          </View>

          <View style={styles.infoSection}>
            <ThemedText type="subtitle">Details</ThemedText>
            <View style={styles.detailItem}>
              <ThemedText type="defaultSemiBold">Major:</ThemedText>
              <ThemedText>{mockUserProfile.major}</ThemedText>
            </View>
            <View style={styles.detailItem}>
              <ThemedText type="defaultSemiBold">Graduation Year:</ThemedText>
              <ThemedText>{mockUserProfile.graduationYear}</ThemedText>
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
          <Button mode="contained" onPress={() => console.log('Edit profile')}>
            Edit Profile
          </Button>
        </Card.Actions>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  profileCard: {
    borderRadius: 12,
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
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 16,
    borderRadius: 8,
    backgroundColor: '#f8f8f8',
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  statItem: {
    alignItems: 'center',
  },
  infoSection: {
    marginVertical: 16,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
}); 