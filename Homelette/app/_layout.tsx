import { Stack, Tabs } from "expo-router";
import { PaperProvider } from "react-native-paper";
import Ionicons from "@expo/vector-icons/Ionicons";
import Octicons from "@expo/vector-icons/Octicons";
import { useAuth } from "@/hooks/useAuth";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
export default function RootLayout() {
  const { user } = useAuth();

  return (
    <PaperProvider>
      {user ? (
        <SafeAreaProvider>
          <SafeAreaView style={{ flex: 1 }}>
            <Tabs screenOptions={{ tabBarActiveTintColor: "#EBC968", headerShown: false }}>
              <Tabs.Screen
                name="index"
                options={{
                  title: "Home",
                  tabBarIcon: ({ color, size }) => (
                    <Ionicons name="home" size={size} color={color} />
                  ),
                }}
              />
              <Tabs.Screen
                name="post"
                options={{
                  title: "Post",
                  tabBarIcon: ({ color, size }) => (
                    <Octicons name="diff-added" size={size} color={color} />
                  ),
                }}
              />
              <Tabs.Screen
                name="messages"
                options={{
                  title: "Messages",
                  tabBarIcon: ({ color, size }) => (
                    <Ionicons name="chatbubbles" size={size} color={color} />
                  ),
                }}
              />
              <Tabs.Screen
                name="profile"
                options={{
                  title: "Profile",
                  tabBarIcon: ({ color, size }) => (
                    <Ionicons name="person" size={size} color={color} />
                  ),
                }}
              />
            </Tabs>
          </SafeAreaView>
        </SafeAreaProvider>
      ) : (
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
        </Stack>
      )}
  </PaperProvider>
  );
}
