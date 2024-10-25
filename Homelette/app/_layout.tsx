import { Stack, Tabs } from "expo-router";
import { PaperProvider } from 'react-native-paper';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function RootLayout() {
  return (
    <PaperProvider>
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
    </PaperProvider>
  );
}
