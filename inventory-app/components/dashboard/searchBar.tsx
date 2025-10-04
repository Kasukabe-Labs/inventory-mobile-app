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
import { useCategoryStore } from "@/store/useCategoryStore";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (text: string) => void;
  onSearch: () => void;
  resetFilters: () => void;
  selectedCategoryId: string | null;
  setSelectedCategoryId: (id: string | null) => void;
}

export default function SearchBar({
  searchQuery,
  setSearchQuery,
  onSearch,
  resetFilters,
  selectedCategoryId,
  setSelectedCategoryId,
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

  const categories = useCategoryStore((state) => state.categories);

  return (
    <View className="flex-col gap-3 px-4 py-3">
      {/* Greeting */}
      <View className="mt-32 flex-col items-start gap-1 w-full">
        <Text className="text-2xl font-black">Product Management 📦</Text>
        <Text className="text-sm text-muted-foreground">
          Search, filter and manage your inventory items
        </Text>
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
        <View className="flex-row gap-2">
          <Select
            value={
              selectedCategoryId
                ? {
                    value: selectedCategoryId,
                    label:
                      categories.find((c) => c.id === selectedCategoryId)
                        ?.name || "",
                  }
                : { value: "", label: "All Categories" }
            }
            onValueChange={(val) => {
              if (val?.value) {
                setSelectedCategoryId(val.value);
              } else {
                setSelectedCategoryId(null);
              }
            }}
          >
            <SelectTrigger className="h-12 bg-background rounded-lg px-3">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Categories</SelectLabel>
                <SelectItem key="all" value="" label="All Categories">
                  All Categories
                </SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id} label={cat.name}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          <AddProduct />
        </View>
      )}
    </View>
  );
}
