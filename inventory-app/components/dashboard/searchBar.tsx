import { Animated, View } from "react-native";
import React, { useRef } from "react";
import { Input } from "../ui/input";
import { User } from "lucide-react-native";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import Feather from "@expo/vector-icons/Feather";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AddProduct } from "./addProductDialog";
import { useAuthStore } from "@/store/useAuthStore";
import { Badge } from "../ui/badge";
import { router } from "expo-router";

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (text: string) => void;
  onSearch: () => void;
  resetFilters: () => void;
}

export default function SearchBar({
  searchQuery,
  setSearchQuery,
  onSearch,
  resetFilters,
}: SearchBarProps) {
  const user = useAuthStore((state) => state.user);

  const insets = useSafeAreaInsets();

  const rotation = useRef(new Animated.Value(0)).current;

  const handlePress = () => {
    // Run reset logic
    resetFilters();

    // Trigger rotation animation
    Animated.sequence([
      Animated.timing(rotation, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(rotation, {
        toValue: 0,
        duration: 0,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Map rotation value to degrees
  const rotate = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View className="flex-col gap-3 px-4 py-3">
      {/* Greeting */}
      <View className="mt-32 flex-col items-start gap-1 w-full">
        <Text variant={"h1"}>{user?.role}</Text>
      </View>

      {/* Search Input */}
      <View className="flex-row items-center gap-2 w-full">
        <View className="flex-1 relative">
          <Input
            placeholder="Search by SKU or Title..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="border border-gray-300 rounded-lg h-12 pl-4 pr-4"
            onSubmitEditing={onSearch}
            returnKeyType="search"
          />
        </View>
        <Button
          variant={"outline"}
          className="h-12 px-4 rounded-lg"
          onPress={handlePress}
        >
          <Animated.View style={{ transform: [{ rotate }] }}>
            <Feather name="refresh-cw" size={20} color={"#27CFF5"} />
          </Animated.View>
        </Button>
      </View>

      {user?.role === "ADMIN" && (
        <>
          <AddProduct />

          {/* <Button
            variant={"secondary"}
            onPress={() =>
              router.push({
                pathname: "/(tabs)/analytics",
              })
            }
          >
            <Text> View Analytics 📊</Text>
          </Button> */}
        </>
      )}
    </View>
  );
}
