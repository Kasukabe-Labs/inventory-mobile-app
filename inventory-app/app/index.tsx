import { View, ActivityIndicator } from "react-native";
import React, { useEffect } from "react";
import { SignInForm } from "@/components/sign-in-form";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "expo-router";

export default function Index() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const isHydrated = useAuthStore((state) => state.isHydrated);

  useEffect(() => {
    if (isHydrated && user) {
      // User is logged in, redirect
      router.replace("/(tabs)/inventory");
    }
  }, [user, isHydrated, router]);

  if (!isHydrated) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  // If hydrated and user is null, show SignInForm
  return (
    <View className="flex-1">
      <SignInForm />
    </View>
  );
}
