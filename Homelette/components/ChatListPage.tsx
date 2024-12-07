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
  KeyboardAvoidingView,
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
import { onSnapshot, doc, updateDoc } from "firebase/firestore";
import { MaterialCommunityIcons } from '@expo/vector-icons';

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
  timestamp: string;
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
            timestamp: formatTimestamp(item["timestamp"]),
          }));
          setChat(formattedData);
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

  const formatTimestamp = (timestamp: any) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    
    // if the message is from today, only show the time
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // if the message is from yesterday
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    
    // if the message is from this week, show the day of the week
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    if (now.getTime() - date.getTime() < 7 * 24 * 60 * 60 * 1000) {
      return weekDays[date.getDay()];
    }
    
    // otherwise, show the date
    return date.toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
    });
  };

  const ConversationCard = ({
    conversation,
  }: {
    conversation: Conversation;
  }) => (
    <TouchableRipple
      onPress={() => handleOpenConversation(conversation)}
      rippleColor="rgba(0, 0, 0, .05)"
    >
      <View style={styles.conversationItem}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatarIconContainer}>
            <MaterialCommunityIcons 
              name="account-group"
              size={30} 
              color="#666666"
            />
          </View>
        </View>
        <View style={styles.conversationContent}>
          <View style={styles.conversationHeader}>
            <Text style={styles.conversationTitle}>{conversation.title}</Text>
            <Text style={styles.timeStamp}>{conversation.timestamp}</Text>
          </View>
        </View>
      </View>
    </TouchableRipple>
  );

  const ChatMessage = ({ message }: { message: Message }) => {
    const [imageLink, setImageLink] = useState("https://via.placeholder.com/100");

    useEffect(() => {
      const userRef = doc(firestore, "users", message.uid);
      const fetchData = onSnapshot(userRef, (snapshot) => {
        if (snapshot.exists() && snapshot.data()["profilePictureURL"]) {
          setImageLink(snapshot.data()["profilePictureURL"]);
        }
      });
      return () => fetchData();
    }, []);

    if (message.uid == auth.currentUser.uid) {
      return (
        <View style={styles.messageRowRight}>
          <View style={styles.messageContentRight}>
            <View style={styles.messageRight}>
              <Text style={styles.messageText}>{message.text}</Text>
            </View>
            <View style={styles.messageTimeContainer}>
              <Text style={styles.messageTime}>{message.timestamp}</Text>
            </View>
          </View>
          <View style={styles.messageAvatarRight}>
            <Image
              source={{ uri: imageLink }}
              style={styles.messageAvatar}
            />
          </View>
        </View>
      );
    }

    return (
      <View style={styles.messageRowLeft}>
        <View style={styles.messageAvatarLeft}>
          <Image
            source={{ uri: imageLink }}
            style={styles.messageAvatar}
          />
        </View>
        <View style={styles.messageContentLeft}>
          <View style={styles.messageLeft}>
            <Text style={styles.messageText}>{message.text}</Text>
          </View>
          <View style={styles.messageTimeContainer}>
            <Text style={styles.messageTime}>{message.timestamp}</Text>
          </View>
        </View>
      </View>
    );
  };

  const ChatWindow = () => {
    const [message, setMessage] = useState("");

    return (
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.chatWindowContainer}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 140 : 0}
      >
        <View style={styles.messagesContainer}>
          <FlashList
            data={chat}
            renderItem={({ item }) => <ChatMessage message={item} />}
            estimatedItemSize={200}
            contentContainerStyle={styles.chatListContainer}
            style={styles.chatListStyle}
            inverted={false}
            showsVerticalScrollIndicator={true}
          />
        </View>

        <View style={styles.inputSection}>
          <TextInput
            style={styles.chatInput}
            placeholder="Type a message..."
            value={message}
            onChangeText={setMessage}
            multiline
            maxLength={500}
          />
          <TouchableRipple
            onPress={() => {
              if (message.trim()) {
                handleSendMessage(
                  auth.currentUser?.uid,
                  currentConversation.id,
                  message,
                );
                setMessage('');
                Keyboard.dismiss();
              }
            }}
            style={styles.sendButtonContainer}
          >
            <MaterialCommunityIcons
              name="send"
              size={24}
              color="#000000"
            />
          </TouchableRipple>
        </View>
      </KeyboardAvoidingView>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Chats</Text>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <MaterialCommunityIcons 
            name="message-processing"
            size={50}
            color={theme.colors.primary}
            style={styles.loadingIcon}
          />
          <Text style={styles.statusText}>Loading messages...</Text>
        </View>
      ) : data.length === 0 ? (
        <View style={styles.centerContainer}>
          <MaterialCommunityIcons 
            name="message-text-outline"
            size={50}
            color={theme.colors.primary}
            style={styles.loadingIcon}
          />
          <Text style={styles.statusText}>No conversations yet</Text>
          <Text style={styles.subStatusText}>
            Your messages will appear here
          </Text>
        </View>
      ) : (
        <FlashList
          data={data}
          renderItem={({ item }) => (
            <ConversationCard conversation={item} />
          )}
          estimatedItemSize={80}
        />
      )}

      <Modal
        visible={isVisible}
        onDismiss={() => {
          setVisible(false);
          setConversation({});
        }}
        contentContainerStyle={styles.modalContainer}
      >
        <View style={styles.chatHeader}>
          <IconButton
            icon="arrow-left"
            size={24}
            onPress={() => setVisible(false)}
            style={styles.backButton}
          />
          <Text style={styles.chatTitle}>{currentConversation.title}</Text>
        </View>
        <ChatWindow />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    backgroundColor: theme.colors.primary,
    padding: 10,
    paddingTop: Platform.OS === 'ios' ? 16 : 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    color: '#000000',
  },
  conversationItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
    backgroundColor: '#FFFFFF',
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  conversationContent: {
    flex: 1,
    justifyContent: 'center',
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  conversationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  timeStamp: {
    fontSize: 12,
    color: '#666666',
  },
  modalContainer: {
    backgroundColor: theme.colors.surface,
    marginTop: 50,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: theme.colors.primary,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  backButton: {
    marginRight: 16,
  },
  chatTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  messageContainer: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F0F0F0',
  },
  messageInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginHorizontal: 8,
    flex: 1,
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  sendButton: {
    backgroundColor: theme.colors.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  messageLeft: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
    marginBottom: 8,
    maxWidth: '80%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1,
  },
  messageRight: {
    backgroundColor: theme.colors.primary + '40',
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignSelf: 'flex-end',
    marginBottom: 8,
    maxWidth: '80%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1,
  },
  messageText: {
    fontSize: 16,
    color: '#000000',
  },
  avatarIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  loadingIcon: {
    marginBottom: 16,
  },
  statusText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  subStatusText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
  chatWindowContainer: {
    backgroundColor: '#F0F0F0',
    flexDirection: 'column'
  },
  messagesContainer: {
    height: '85%',
  },
  chatListContainer: {
    padding: 16,
    paddingBottom: 8,
  },
  chatListStyle: {
    flexGrow: 1,
  },
  inputSection: {
    height: '15%',
    marginTop: -20,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  chatInput: {
    flex: 1,
    backgroundColor: '#F8F8F8',
    borderRadius: 10,
    paddingHorizontal: 16,
    marginRight: 8,
    maxHeight: 65,
    fontSize: 16,
  },
  sendButtonContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  messageLeft: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignSelf: 'flex-start',
    marginBottom: 4,
    maxWidth: '80%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  messageRight: {
    backgroundColor: theme.colors.primary + '40',
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignSelf: 'flex-end',
    marginBottom: 4,
    maxWidth: '80%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  messageText: {
    fontSize: 16,
    color: '#000000',
    lineHeight: 20,
  },
  messageRowLeft: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 12,
    paddingRight: '15%',
  },
  
  messageRowRight: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 12,
    paddingLeft: '15%',
  },

  messageContentLeft: {
    flex: 1,
    marginLeft: 8,
  },

  messageContentRight: {
    flex: 1,
    marginRight: 8,
    alignItems: 'flex-end',
  },

  messageAvatarLeft: {
    width: 28,
    height: 28,
    marginLeft: 8,
  },

  messageAvatarRight: {
    width: 28,
    height: 28,
    marginRight: 8,
  },

  messageAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E0E0E0',
  },

  messageLeft: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderTopLeftRadius: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
    maxWidth: '100%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },

  messageRight: {
    backgroundColor: theme.colors.primary + '40',
    borderRadius: 18,
    borderTopRightRadius: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignSelf: 'flex-end',
    maxWidth: '100%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },

  messageText: {
    fontSize: 15,
    color: '#000000',
    lineHeight: 20,
  },

  messageTimeContainer: {
    marginTop: 4,
    marginHorizontal: 4,
  },

  messageTime: {
    fontSize: 11,
    color: '#666666',
  },
});

