import { Stack, Tabs } from "expo-router";
import { PaperProvider } from 'react-native-paper';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAuth } from "@/hooks/useAuth";

export default function RootLayout() {
  const { user } = useAuth();

  return (
    <PaperProvider>
      {user ? (
        <Tabs>
          <Tabs.Screen
            name="index"
            options={{
              title: 'Home',
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="home" size={size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="rent"
            options={{
              title: 'Rent',
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="business" size={size} color={color} />
              ),
            }}
          />
        </Tabs>
      ) : (
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
        </Stack>
      )}
    </PaperProvider>
  );
}
