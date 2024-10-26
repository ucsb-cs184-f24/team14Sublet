import React from "react";
import { WelcomePage } from "@/components/WelcomePage";
import { HomePage } from "@/components/HomePage";
import { useAuth } from "@/hooks/useAuth";

export default function Index() {
  const { user } = useAuth();

  if (user) {
    return <HomePage user={user} />;
  }

  return <WelcomePage />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
