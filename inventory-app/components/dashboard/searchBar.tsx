import { Animated, View, useColorScheme } from "react-native";
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
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

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
        <Text
          className={`text-2xl font-black ${isDark ? "text-white" : "text-black"}`}
        >
          Product Management 📦
        </Text>
        <Text
          className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}
        >
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
            className={`border rounded-lg h-12 pl-4 pr-4 ${
              isDark
                ? "border-gray-700 bg-gray-900 text-white"
                : "border-gray-300 bg-white text-black"
            }`}
            placeholderTextColor={isDark ? "#9ca3af" : "#6b7280"}
            onSubmitEditing={onSearch}
            returnKeyType="search"
          />
        </View>
        <Button
          variant={"secondary"}
          className="h-12 px-4 rounded-lg"
          onPress={onSearch}
        >
          <Feather name="search" size={20} color={isDark ? "white" : "black"} />
        </Button>
      </View>

      {user?.role === "ADMIN" && (
        <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
          {/* wrapper that will take remaining width */}
          <View style={{ flex: 1, minWidth: 0 }}>
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
                if (val?.value) setSelectedCategoryId(val.value);
                else setSelectedCategoryId(null);
              }}
            >
              {/* Make trigger stretch to fill wrapper */}
              <SelectTrigger
                style={{ height: 48, flex: 1, justifyContent: "center" }}
                className={
                  isDark
                    ? "bg-gray-900 border-gray-700"
                    : "bg-white border-gray-300"
                }
              >
                <SelectValue
                  placeholder="All Categories"
                  className={isDark ? "text-white" : "text-black"}
                />
              </SelectTrigger>

              <SelectContent
                className={
                  isDark
                    ? "bg-gray-900 border-gray-700"
                    : "bg-white border-gray-300"
                }
              >
                <SelectGroup>
                  <SelectLabel className={isDark ? "text-white" : "text-black"}>
                    Categories
                  </SelectLabel>
                  <SelectItem
                    key="all"
                    value=""
                    label="All Categories"
                    className={isDark ? "text-white" : "text-black"}
                  >
                    All Categories
                  </SelectItem>
                  {categories.map((cat) => (
                    <SelectItem
                      key={cat.id}
                      value={cat.id}
                      label={cat.name}
                      className={isDark ? "text-white" : "text-black"}
                    >
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </View>

          <AddProduct />

          <Button
            variant="secondary"
            style={{ height: 48, paddingHorizontal: 12, borderRadius: 8 }}
            onPress={handlePress}
          >
            <Animated.View style={{ transform: [{ rotate }] }}>
              <Feather
                name="refresh-cw"
                size={20}
                color={isDark ? "white" : "black"}
              />
            </Animated.View>
          </Button>
        </View>
      )}
    </View>
  );
}
