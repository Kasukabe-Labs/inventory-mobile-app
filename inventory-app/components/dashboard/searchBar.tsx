import {
  Animated,
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import React, { useRef } from "react";
import { Text } from "react-native";
import Feather from "@expo/vector-icons/Feather";
import { AddProduct } from "./addProductDialog";
import { useAuthStore } from "@/store/useAuthStore";
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
import { NativeCategoryDropdown } from "../NativeCategoryDropdown";

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
  const categories = useCategoryStore((state) => state.categories);

  const rotation = useRef(new Animated.Value(0)).current;

  const handlePress = () => {
    resetFilters();

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

  const rotate = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={styles.container}>
      {/* Greeting */}
      <View style={styles.greetingSection}>
        <Text style={styles.title}>Product Management 📦</Text>
        <Text style={styles.subtitle}>
          Search, filter and manage your inventory items
        </Text>
      </View>

      {/* Search Input */}
      <View style={styles.searchRow}>
        <View style={styles.searchInputContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by SKU or Title..."
            placeholderTextColor="#6b7280"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={onSearch}
            returnKeyType="search"
          />
        </View>
        <TouchableOpacity style={styles.searchButton} onPress={onSearch}>
          <Feather name="search" size={20} color="#1f2937" />
        </TouchableOpacity>
      </View>

      {user?.role === "ADMIN" && (
        <View style={styles.filterRow}>
          <View style={styles.selectContainer}>
            <NativeCategoryDropdown
              value={selectedCategoryId || ""}
              onValueChange={(categoryId) => {
                if (categoryId) setSelectedCategoryId(categoryId);
                else setSelectedCategoryId(null);
              }}
              categories={[{ id: "", name: "All Categories" }, ...categories]}
              placeholder="All Categories"
            />
          </View>

          {/* Add Product */}
          <AddProduct />

          {/* Refresh Button */}
          <TouchableOpacity style={styles.refreshButton} onPress={handlePress}>
            <Animated.View style={{ transform: [{ rotate }] }}>
              <Feather name="refresh-cw" size={20} color="#1f2937" />
            </Animated.View>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  greetingSection: {
    marginTop: 128,
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 4,
    width: "100%",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1f2937",
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    width: "100%",
  },
  searchInputContainer: {
    flex: 1,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    height: 48,
    paddingHorizontal: 16,
    backgroundColor: "#ffffff",
    fontSize: 16,
    color: "#1f2937",
  },
  searchButton: {
    height: 48,
    width: 48,
    borderRadius: 8,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
  },
  filterRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  selectContainer: {
    flex: 1,
    minWidth: 0,
  },
  selectTrigger: {
    height: 48,
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#ffffff",
    borderColor: "#d1d5db",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  selectContent: {
    backgroundColor: "#ffffff",
    borderColor: "#d1d5db",
    borderWidth: 1,
    borderRadius: 8,
  },
  refreshButton: {
    height: 48,
    width: 48,
    borderRadius: 8,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
  },
});
