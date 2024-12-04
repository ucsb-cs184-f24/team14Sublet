import React from "react";
import { useState, useEffect } from "react";
import { View, StyleSheet, Image, Modal } from "react-native";
import { Card, Title, Paragraph, Button, TextInput } from "react-native-paper";
import { ThemedText } from "./ThemedText";
import { firestore } from "../config/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useAuth } from "@/hooks/useAuth";
import { updateUserProfile } from "../config/firebase";

// Mock user profile data
// const mockUserProfile = {
//   firstName: "John",
//   lastName: "Doe",
//   email: "john.doe@ucsb.edu",
//   joinDate: "March 2024",
//   school: "UC Santa Barbara",
//   major: "Computer Science",
//   graduationYear: "2025",
//   bio: "Looking for housing near UCSB campus. Clean, quiet, and responsible tenant.",
//   listings: 2,
//   reviews: 4.5,
// };

// Add these interfaces at the top of the file
interface EditFormData {
  first: string;
  last: string;
  phone: string;
}

interface EditProfileModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: () => void;
  editForm: EditFormData;
  setEditForm: React.Dispatch<React.SetStateAction<EditFormData>>;
}

// Move EditProfileModal outside of ProfilePage
const EditProfileModal = ({
  visible,
  onClose,
  onSave,
  editForm,
  setEditForm,
}: EditProfileModalProps) => (
  <Modal
    visible={visible}
    animationType="slide"
    transparent={true}
    onRequestClose={onClose}
  >
    <View style={styles.modalContainer}>
      <Card style={styles.modalCard}>
        <Card.Title title="Edit Profile" titleStyle={styles.modalTitle} />
        <Card.Content>
          <TextInput
            label="First Name"
            value={editForm.first}
            onChangeText={(text) =>
              setEditForm((prev) => ({ ...prev, first: text }))
            }
            style={styles.input}
            mode="outlined"
            outlineColor="#006aff"
            activeOutlineColor="#006aff"
            textColor="black"
            theme={{
              colors: {
                primary: "#006aff",
                background: "white",
                text: "black",
                placeholder: "gray",
                onSurfaceVariant: "black",
              },
            }}
          />
          <TextInput
            label="Last Name"
            value={editForm.last}
            onChangeText={(text) =>
              setEditForm((prev) => ({ ...prev, last: text }))
            }
            style={styles.input}
            mode="outlined"
            outlineColor="#006aff"
            activeOutlineColor="#006aff"
            textColor="black"
            theme={{
              colors: {
                primary: "#006aff",
                background: "white",
                text: "black",
                placeholder: "gray",
                onSurfaceVariant: "black",
              },
            }}
          />
          <TextInput
            label="Phone"
            value={editForm.phone}
            onChangeText={(text) =>
              setEditForm((prev) => ({ ...prev, phone: text }))
            }
            keyboardType="numeric"
            style={styles.input}
            mode="outlined"
            outlineColor="#006aff"
            activeOutlineColor="#006aff"
            textColor="black"
            theme={{
              colors: {
                primary: "#006aff",
                background: "white",
                text: "black",
                placeholder: "gray",
                onSurfaceVariant: "black",
              },
            }}
          />
        </Card.Content>
        <Card.Actions>
          <Button onPress={onClose} textColor="#006aff">
            Cancel
          </Button>
          <Button onPress={onSave} mode="contained" buttonColor="#006aff">
            Save
          </Button>
        </Card.Actions>
      </Card>
    </View>
  </Modal>
);

export function ProfilePage() {
  const { user } = useAuth();
  const [userData, setUserData] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<EditFormData>({
    first: "",
    last: "",
    phone: "",
  });

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        const userDocRef = doc(firestore, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          setUserData(userData);
          console.log(userData);
        } else {
          console.log("No such document!");
        }
      }
    };

    fetchUserData();
  }, [user]);

  const handleEditPress = () => {
    setEditForm({
      first: userData?.first || "",
      last: userData?.last || "",
      phone: userData?.phone?.toString() || "",
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      const updates = {
        first: editForm.first,
        last: editForm.last,
        phone: parseInt(editForm.phone) || 0,
      };

      await updateUserProfile(user.uid, updates);

      // Update local state
      setUserData((prev) => ({
        ...prev,
        ...updates,
      }));

      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Card style={styles.profileCard}>
        <View style={styles.headerSection}>
          <Image
            source={
              userData?.profilePictureURL
                ? { uri: userData.profilePictureURL }
                : require("../assets/images/default-pfp.png")
            }
            style={styles.profileImage}
          />
          <View style={styles.headerInfo}>
            <Title>{`${userData?.first} ${userData?.last}`}</Title>
            <Paragraph>{userData?.school || ""}</Paragraph>
          </View>
        </View>

        <Card.Content>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <ThemedText type="title">
                {userData?.listing_ids?.length}
              </ThemedText>
              <ThemedText>Listings</ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText type="title">
                {userData?.interested_listing_ids?.length}
              </ThemedText>
              <ThemedText>Interested In</ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText type="title">{userData?.rating || "N/A"}</ThemedText>
              <ThemedText>Rating</ThemedText>
            </View>
          </View>

          <View style={styles.infoSection}>
            <ThemedText type="subtitle">About Me</ThemedText>
            <ThemedText>{userData?.about_me || "N/A"}</ThemedText>
          </View>

          <View style={styles.infoSection}>
            <ThemedText type="subtitle">Details</ThemedText>
            <View style={styles.detailItem}>
              <ThemedText type="defaultSemiBold">Major:</ThemedText>
              <ThemedText>{userData?.major || "N/A"}</ThemedText>
            </View>
            <View style={styles.detailItem}>
              <ThemedText type="defaultSemiBold">Graduation Year:</ThemedText>
              <ThemedText>{userData?.graduation_year || "N/A"}</ThemedText>
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
          <Button mode="contained" onPress={handleEditPress}>
            Edit Profile
          </Button>
        </Card.Actions>
      </Card>

      <EditProfileModal
        visible={isEditing}
        onClose={() => setIsEditing(false)}
        onSave={handleSave}
        editForm={editForm}
        setEditForm={setEditForm}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f5f5f5",
  },
  profileCard: {
    borderRadius: 12,
  },
  headerSection: {
    flexDirection: "row",
    padding: 16,
    alignItems: "center",
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
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 16,
    borderRadius: 8,
    backgroundColor: "#f8f8f8",
    padding: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  statItem: {
    alignItems: "center",
  },
  infoSection: {
    marginVertical: 16,
  },
  detailItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 4,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 20,
  },
  modalCard: {
    padding: 20,
    backgroundColor: "white",
    elevation: 5,
  },
  modalTitle: {
    color: "black",
    fontSize: 20,
    fontWeight: "bold",
  },
  input: {
    marginBottom: 15,
    backgroundColor: "white",
    height: 56,
  },
});
