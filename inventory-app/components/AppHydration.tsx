import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { useAuthStore } from "@/store/useAuthStore";

interface AppHydrationProps {
  children: React.ReactNode;
}

export function AppHydration({ children }: AppHydrationProps) {
  const hydrateUser = useAuthStore((state) => state.hydrateUser);
  const isHydrated = useAuthStore((state) => state.isHydrated);

  useEffect(() => {
    hydrateUser();
  }, [hydrateUser]);

  if (!isHydrated) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
});
