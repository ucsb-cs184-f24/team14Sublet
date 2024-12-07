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
  Avatar,
} from "react-native-paper";
import {
  auth,
  firestore,
  getConversationTitles,
  sendMessage,
} from "@/config/firebase";
import { FlashList } from "@shopify/flash-list";
import { onSnapshot, doc, updateDoc } from "firebase/firestore";

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
  authorId?: string;
}

interface Message {
  text: string;
  uid: string;
  timestamp: number;
  is_image: boolean;
}

export function ChatListPage() {
  const [data, setData] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [isVisible, setVisible] = useState(false);
  const [currentConversation, setConversation] = useState<Conversation>({} as Conversation);
  const [chat, setChat] = useState<Message[]>([]);
  const [loadingChat, setLoadingChat] = useState(true);
  const [shift, setShift] = useState(new Animated.Value(0));
  const [authorImages, setAuthorImages] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const userRef = doc(firestore, "users", auth.currentUser.uid);

    const fetchData = onSnapshot(userRef, (snapshot) => {
      if (snapshot.exists()) {
        if (snapshot.data()["conversations"] != null) {
          let result = snapshot.data()["conversations"];
          if (result == null) {
            console.log("No conversation data, creating field for current user");
            const updates = { conversations: [] };
            updateDoc(userRef, updates);
            result = [];
          }
          const formattedData = result.map((item: any) => ({
            id: item["conversation_id"],
            title: item["conversation_title"],
            authorId: item.conversation_id.split('_').find((id: string) => id !== auth.currentUser.uid)
          }));
          setData(formattedData);

          // Fetch author profile pictures
          formattedData.forEach((conversation: Conversation) => {
            if (conversation.authorId) {
              const authorRef = doc(firestore, "users", conversation.authorId);
              onSnapshot(authorRef, (authorSnap) => {
                if (authorSnap.exists() && authorSnap.data().profilePictureURL) {
                  setAuthorImages(prev => ({
                    ...prev,
                    [conversation.authorId]: authorSnap.data().profilePictureURL
                  }));
                }
              });
            }
          });
        }
      }
      setLoading(false);
    });

    return () => fetchData();
  }, []);

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
    if (!currentConversation.id) return;

    const conversationRef = doc(firestore, "conversations", currentConversation.id);
    const fetchData = onSnapshot(conversationRef, (snapshot) => {
      if (snapshot.exists()) {
        setLoadingChat(true);
        if (snapshot.data() != null) {
          const result = snapshot.data()["messages"];
          if (result == null) {
            console.log("An error occurred");
            return;
          }
          setChat(result);
        }
      }
      setLoadingChat(false);
    });

    return () => fetchData();
  }, [currentConversation]);

  const handleOpenConversation = (conversation: Conversation) => {
    setConversation(conversation);
    setVisible(true);
  };

  const ConversationCard = ({ conversation }: { conversation: Conversation }) => (
    <View style={styles.cardWrapper}>
      <TouchableRipple
        onPress={() => handleOpenConversation(conversation)}
        rippleColor="rgba(0, 0, 0, .08)"
      >
        <Card style={styles.card}>
          <Card.Content style={styles.cardContent}>
            <Avatar.Image
              size={40}
              source={{ uri: authorImages[conversation.authorId] || 'https://via.placeholder.com/40' }}
              style={styles.avatar}
            />
            <Text style={styles.conversation}>{conversation.title}</Text>
          </Card.Content>
        </Card>
      </TouchableRipple>
    </View>
  );

  const ChatWindow = () => {
    const [message, setMessage] = useState("");
    const authorId = currentConversation.authorId;
    const authorImage = authorImages[authorId];

    const handleSendMessage = () => {
      if (message.trim()) {
        sendMessage(auth.currentUser?.uid, currentConversation.id, message);
        setMessage("");
      }
    };

    return (
      <View style={styles.modalContainer}>
        <View style={styles.chatHeader}>
          <Avatar.Image
            size={40}
            source={{ uri: authorImage || 'https://via.placeholder.com/40' }}
          />
          <Text style={styles.modalTitle}>{currentConversation.title}</Text>
          <IconButton
            icon="close"
            size={24}
            onPress={() => setVisible(false)}
            style={styles.closeButton}
          />
        </View>

        <FlashList
          data={chat}
          renderItem={({ item }) => (
            <View style={[
              styles.messageContainer,
              item.uid === auth.currentUser.uid ? styles.messageRight : styles.messageLeft
            ]}>
              <Text style={[
                styles.messageText,
                item.uid === auth.currentUser.uid ? styles.messageTextRight : styles.messageTextLeft
              ]}>{item.text}</Text>
            </View>
          )}
          estimatedItemSize={200}
          inverted={false}
        />

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.messageInput}
            placeholder="Type your message..."
            value={message}
            onChangeText={setMessage}
            mode="outlined"
            right={
              <TextInput.Icon
                icon="send"
                onPress={handleSendMessage}
                forceTextInputFocus={false}
              />
            }
            onSubmitEditing={handleSendMessage}
          />
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <PaperProvider theme={theme}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loading}>Loading...</Text>
        </View>
      </PaperProvider>
    );
  }

  if (data.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No conversations found</Text>
      </View>
    );
  }

  return (
    <PaperProvider theme={theme}>
      <Animated.View style={[styles.container, { transform: [{ translateY: shift }] }]}>
        <FlashList
          data={data}
          renderItem={({ item }) => <ConversationCard conversation={item} />}
          estimatedItemSize={80}
          ItemSeparatorComponent={() => <Divider style={styles.divider} />}
        />
        <Portal>
          <Modal
            visible={isVisible}
            onDismiss={() => {
              setVisible(false);
              setConversation({} as Conversation);
            }}
            style={styles.modal}
            contentContainerStyle={styles.modalContainer}
          >
            <ChatWindow />
          </Modal>
        </Portal>
        <StatusBar style="auto" />
      </Animated.View>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    height: Dimensions.get("screen").height - 100,
    width: Dimensions.get("screen").width,
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  cardWrapper: {
    backgroundColor: theme.colors.surface,
  },
  card: {
    elevation: 0,
    backgroundColor: theme.colors.surface,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  avatar: {
    marginRight: 16,
  },
  conversation: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.text,
    flex: 1,
  },
  modalContainer: {
    backgroundColor: theme.colors.surface,
    margin: 16,
    borderRadius: 12,
    height: Dimensions.get("window").height - 160,
    overflow: 'hidden',
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.background,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 16,
    color: theme.colors.text,
    flex: 1,
  },
  closeButton: {
    margin: 0,
  },
  messageContainer: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 20,
    marginVertical: 4,
    marginHorizontal: 16,
  },
  messageLeft: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.primaryContainer,
    borderBottomLeftRadius: 4,
  },
  messageRight: {
    alignSelf: 'flex-end',
    backgroundColor: theme.colors.primary,
    borderBottomRightRadius: 4,
  },
  messageText: {
    fontSize: 16,
  },
  messageTextLeft: {
    color: theme.colors.text,
  },
  messageTextRight: {
    color: theme.colors.onPrimaryContainer,
  },
  inputContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.background,
  },
  messageInput: {
    backgroundColor: theme.colors.surface,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loading: {
    fontSize: 20,
    color: theme.colors.text,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  emptyText: {
    fontSize: 18,
    color: theme.colors.text,
  },
  modal: {
    margin: 0,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.background,
  },
});