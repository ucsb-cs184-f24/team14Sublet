import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Dimensions,
  StatusBar,
  Keyboard,
  Platform,
  Animated,
  Image,
} from "react-native";
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
  TouchableRipple,
  TextInput,
} from "react-native-paper";
import {
  auth,
  firestore,
  getConversationTitles,
  sendMessage,
} from "@/config/firebase";
import { FlashList } from "@shopify/flash-list";
import { onSnapshot, doc } from "firebase/firestore";

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

interface Conversation {
  id: string;
  title: string;
}

interface Message {
  text: string;
  uid: string;
}

export function ChatListPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isVisible, setVisible] = useState(false);
  const [currentConversation, setConversation] = useState({});
  const [chat, setChat] = useState([]);
  const [loadingChat, setLoadingChat] = useState(true);
  const [shift, setShift] = useState(new Animated.Value(0));

  useEffect(() => {
    const userRef = doc(firestore, "users", auth.currentUser.uid);

    const fetchData = onSnapshot(userRef, (snapshot) => {
      if (snapshot.exists()) {
        if (snapshot.data()["conversations"] != null) {
          let result = snapshot.data()["conversations"];
          if (result == null) {
            console.log(
              "No conversation data, creating field for current user",
            );
            updates = { conversations: [] };
            updateDoc(userRef, updates);
            result = [];
          }
          const formattedData = result.map((item: any) => ({
            id: item["conversation_id"],
            title: item["conversation_title"],
          }));
          setData(formattedData);
        }
      } else {
        console.log("Not found");
      }
      setLoading(false);
    });

    return () => fetchData();
  }, []);

  // useEffect(() => {
  //   console.log(currentConversation.title);
  // }, [currentConversation]);

  let test: Conversation = {
    id: "123",
    title: "456",
  };

  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      (event) => {
        Animated.timing(shift, {
          toValue: -120,
          duration: event.duration || 200,
          useNativeDriver: true,
        }).start();
      },
    );

    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => {
        Animated.timing(shift, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start();
      },
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, [shift]);

  useEffect(() => {
    if (!currentConversation.id) {
      return;
    }

    const conversationRef = doc(
      firestore,
      "conversations",
      currentConversation.id,
    );
    const fetchData = onSnapshot(conversationRef, (snapshot) => {
      if (snapshot.exists()) {
        setLoadingChat(true);
        if (snapshot.data() != null) {
          let result = snapshot.data()["messages"];
          if (result == null) {
            console.log("An error occurred");
            return [];
          }
          const formattedData = result.map((item: any) => ({
            text: item["text"],
            uid: item["uid"],
          }));
          setChat(result);
          console.log(result);
        }
      } else {
        console.log("Not found");
      }
      setLoadingChat(false);
    });

    return () => fetchData();
  }, [currentConversation]);

  const handleOpenConversation = (conversation: Conversation) => {
    setConversation(conversation);
    setVisible(true);
  };

  const handleSendMessage = (
    senderId: string,
    conversationId: string,
    text: string,
  ) => {
    sendMessage(senderId, conversationId, text);
  };

  const ConversationCard = ({
    conversation,
  }: {
    conversation: Conversation;
  }) => (
    <View style={{ backgroundColor: "#FFFFFF", marginBottom: 10 }}>
      <TouchableRipple
        key={conversation.id}
        rippleColor="rgba(100, 100, 0, .32)"
        onPress={() => handleOpenConversation(conversation)}
      >
        {/* <Card style={styles.card} elevation={3}> */}
        <Card.Content style={styles.cardContent}>
          <Text style={styles.conversation}>{conversation.title}</Text>
        </Card.Content>
        {/* </Card> */}
      </TouchableRipple>
    </View>
  );

  const ChatMessage = ({ message }: { message: Message }) => {
    const [imageLink, setImageLink] = useState(
      "https://via.placeholder.com/100",
    );

    useEffect(() => {
      const userRef = doc(firestore, "users", message.uid);

      const fetchData = onSnapshot(userRef, (snapshot) => {
        if (snapshot.exists()) {
          if (snapshot.data()["profilePictureURL"] != null) {
            setImageLink(snapshot.data()["profilePictureURL"]);
          }
        } else {
          console.log("Image link not found");
        }
      });

      return () => fetchData();
    }, []);

    if (message.uid == auth.currentUser.uid) {
      return (
        <View style={{ flexDirection: "column" }}>
          <Image
            source={{ uri: imageLink }}
            style={{
              width: 20,
              height: 20,
              borderRadius: 10,
              alignSelf: "flex-end",
            }}
          />
          <View style={styles.messageRight}>
            <Text style={styles.messageText}>{message.text}</Text>
          </View>
        </View>
      );
    }

    return (
      <View style={{ flexDirection: "column" }}>
        <Image
          source={{ uri: imageLink }}
          style={{
            width: 20,
            height: 20,
            borderRadius: 10,
            alignSelf: "flex-start",
          }}
        />
        <View style={styles.messageLeft}>
          <Text style={styles.messageText}>{message.text}</Text>
        </View>
      </View>
    );
  };

  const ChatWindow = () => {
    const [message, setMessage] = useState("");

    // let dummyMessage: Message = { text: "abc", uid: "a" };
    // let dummyData = [
    //   dummyMessage,
    //   dummyMessage,
    //   dummyMessage,
    //   dummyMessage,
    //   { text: "aaaaa", uid: auth.currentUser.uid },
    //   dummyMessage,
    //   dummyMessage,
    //   dummyMessage,
    //   dummyMessage,
    //   dummyMessage,
    //   dummyMessage,
    //   dummyMessage,
    // ];

    if (loadingChat) {
      return (
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>{currentConversation.title}</Text>
          <FlashList
            data={chat}
            renderItem={({ item }) => (
              <ChatMessage message={item}></ChatMessage>
            )}
            estimatedItemSize={200}
          />

          <View
            style={{
              alignSelf: "stretch",
              flexDirection: "row",
              gap: 8,
              justifyContent: "center",
              marginTop: 10,
              marginHorizontal: 10,
            }}
          >
            <TextInput
              style={styles.messageInput}
              placeholder={`Your message here`}
              value={message}
              onChangeText={setMessage}
            />
            <Button
              mode="contained"
              onPress={() => {
                // handleSendMessage(
                //   auth.currentUser?.uid,
                //   currentConversation.id,
                //   message,
                // );
                console.log(message);
              }}
              style={{
                height: "100%",
                paddingVertical: 6,
                width: "25%",
              }}
            >
              <Text style={{ fontSize: 14 }}>Send</Text>
            </Button>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.modalContainer}>
        <Text style={styles.modalTitle}>{currentConversation.title}</Text>
        <FlashList
          data={chat}
          renderItem={({ item }) => <ChatMessage message={item}></ChatMessage>}
          estimatedItemSize={200}
        />

        <View
          style={{
            alignSelf: "stretch",
            flexDirection: "row",
            gap: 8,
            justifyContent: "center",
            marginTop: 10,
            marginHorizontal: 10,
          }}
        >
          <TextInput
            style={styles.messageInput}
            placeholder={`Your message here`}
            value={message}
            onChangeText={setMessage}
          />
          <Button
            mode="contained"
            onPress={() => {
              handleSendMessage(
                auth.currentUser?.uid,
                currentConversation.id,
                message,
              );
              console.log(message);
            }}
            style={{
              height: "100%",
              paddingVertical: 6,
              width: "25%",
              backgroundColor: theme.colors.primary,
            }}
          >
            <Text style={{ fontSize: 12, color: "#000000" }}>Send</Text>
          </Button>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <PaperProvider theme={theme}>
        <Card style={styles.card} elevation={2}>
          <Card.Content>
            <View>
              <Title style={styles.loading}>Loading...</Title>
            </View>
          </Card.Content>
        </Card>
      </PaperProvider>
    );
  } else if (data.length == 0) {
    return (
      <Card.Content style={styles.cardContent}>
        <Text style={styles.conversation}>No conversations found</Text>
      </Card.Content>
    );
  }

  return (
    <Animated.View
      style={[
        {
          height: Dimensions.get("screen").height - 100,
          width: Dimensions.get("screen").width,
          flex: 1,
        },
        { transform: [{ translateY: shift }] },
      ]}
    >
      <FlashList
        data={data}
        renderItem={({ item }) => (
          <ConversationCard conversation={item}></ConversationCard>
        )}
        estimatedItemSize={200}
      />
      <Modal
        animationType="slide"
        transparent={true}
        visible={isVisible}
        onDismiss={() => {
          setVisible(false);
          setConversation({});
        }}
        style={{ flex: 1 }}
      >
        <ChatWindow></ChatWindow>
      </Modal>
    </Animated.View>
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
    marginBottom: 2,
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
    padding: 30,
    // backgroundColor: theme.colors.surface,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  loading: {
    fontSize: 24,
    fontWeight: "bold",
    color: theme.colors.text,
  },
  conversation: {
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
    // flexDirection: "column",
    // flex: 1,
    backgroundColor: theme.colors.surface,
    padding: 20,
    margin: 20,
    borderRadius: 12,
    height: Dimensions.get("window").height - 200,
    // width: Dimensions.get("screen").width - 40,
  },
  modalTitle: {
    textAlign: "center",
    marginBottom: 16,
    fontSize: 24,
    color: "#000000",
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
  messageLeft: {
    backgroundColor: theme.colors.chatButton,
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignSelf: "flex-start",
    marginBottom: 10,
  },
  messageRight: {
    backgroundColor: theme.colors.chatButton,
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignSelf: "flex-end",
    marginBottom: 10,
  },
  messageText: {
    fontSize: 20,
    fontWeight: "600",
    color: theme.colors.onBackground,
  },
  messageInput: {
    width: "85%",
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
