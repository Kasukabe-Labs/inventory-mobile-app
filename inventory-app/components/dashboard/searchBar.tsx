import { View } from "react-native";
import React from "react";
import { Input } from "../ui/input";
import { Search, Plus, Filter } from "lucide-react-native";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { TriggerRef } from "@rn-primitives/select";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AddProduct } from "./addProductDialog";

const fruits = [
  { label: "Apple", value: "apple" },
  { label: "Banana", value: "banana" },
  { label: "Blueberry", value: "blueberry" },
  { label: "Grapes", value: "grapes" },
  { label: "Pineapple", value: "pineapple" },
];

export default function SearchBar() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState("all");
  const selectRef = React.useRef<TriggerRef>(null);

  const ref = React.useRef<TriggerRef>(null);
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

  // Workaround for rn-primitives/select not opening on mobile
  function onTouchStart() {
    ref.current?.open();
  }

  function handleSearch() {
    console.log(
      "Searching for:",
      searchQuery,
      "in category:",
      selectedCategory
    );
    // Add your search logic here
  }

  return (
    <View className="flex-col gap-3 px-4 py-3">
      {/* Search Input Section */}
      <View className="flex-row items-center gap-2 w-full">
        <View className="flex-1 relative">
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="border border-gray-300 rounded-lg h-12 pl-4 pr-4"
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
        </View>
        <Button className="h-12 px-4 rounded-lg" onPress={handleSearch}>
          <Icon as={Search} size={20} className="text-primary-foreground" />
        </Button>
      </View>

      {/* Action Buttons Section */}
      <View className="flex-row justify-between items-center gap-2">
        {/* Add New Product Button */}
        <AddProduct />

        {/* Filter by Category Dropdown */}
        <Select>
          <SelectTrigger
            ref={ref}
            className="w-[180px]"
            onTouchStart={onTouchStart}
          >
            <SelectValue placeholder="Select a fruit" />
          </SelectTrigger>
          <SelectContent insets={contentInsets} className="w-[180px]">
            <SelectGroup>
              <SelectLabel>Fruits</SelectLabel>
              {fruits.map((fruit) => (
                <SelectItem
                  key={fruit.value}
                  label={fruit.label}
                  value={fruit.value}
                >
                  {fruit.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </View>
    </View>
  );
}
