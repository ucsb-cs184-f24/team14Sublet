import React, { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { WelcomePage } from "@/components/WelcomePage";
import { HomePage } from "@/components/HomePage";
import { auth } from "@/config/firebase";
import { onAuthStateChanged, User } from "firebase/auth";


export default function Index() {
  const [user, setUser] = useState<User | null>(null);


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  if (user) {
    return <HomePage user={user} />;
  }

  return <WelcomePage />;
}
