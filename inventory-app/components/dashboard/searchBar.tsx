import { View } from "react-native";
import React from "react";
import { Input } from "../ui/input";
import { Search, User } from "lucide-react-native";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import type { TriggerRef } from "@rn-primitives/select";
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
}

export default function SearchBar({
  searchQuery,
  setSearchQuery,
  onSearch,
}: SearchBarProps) {
  const user = useAuthStore((state) => state.user);

  const insets = useSafeAreaInsets();
  const contentInsets = {
    top: insets.top,
    bottom: Platform.select({
      ios: insets.bottom,
      android: insets.bottom + 24,
    }),
    left: 12,
    right: 12,
  };

  return (
    <View className="flex-col gap-3 px-4 py-3">
      {/* Greeting */}
      <View className="mt-32 flex-col items-start gap-1 w-full">
        <View className="flex-row items-center gap-2">
          <Text variant={"h1"}>Welcome</Text>
          {user?.role && (
            <Badge
              variant="secondary"
              className={`mt-1 ${
                user?.role === "ADMIN"
                  ? "bg-emerald-500 dark:bg-emerald-600"
                  : "bg-blue-500 dark:bg-blue-600"
              }`}
            >
              <Icon as={User} className="text-white" />
              <Text className="text-white">{user?.role}</Text>
            </Badge>
          )}
        </View>

        {user?.email && (
          <Text variant={"muted"} className="mt-1">
            Your email: {user.email}
          </Text>
        )}
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
        <Button className="h-12 px-4 rounded-lg" onPress={onSearch}>
          <Icon as={Search} size={20} className="text-primary-foreground" />
        </Button>
      </View>

      {user?.role === "ADMIN" && (
        <>
          <AddProduct />

          <Button
            onPress={() =>
              router.push({
                pathname: "/analytics",
              })
            }
          >
            <Text> View Analytics 📊</Text>
          </Button>
        </>
      )}
    </View>
  );
}
