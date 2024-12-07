import React from "react";
import { WelcomePage } from "@/components/WelcomePage";
import { HomePage } from "@/components/HomePage";
import { useAuth } from "@/hooks/useAuth";
import { LogBox } from 'react-native';

// ignore all logs
LogBox.ignoreAllLogs();

export default function Index() {
  const { user } = useAuth();

  if (user) {
    return <HomePage user={user} />;
  }

  return <WelcomePage />;
}