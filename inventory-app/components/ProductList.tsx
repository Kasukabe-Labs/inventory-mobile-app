import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  ActivityIndicator,
  RefreshControl,
  Pressable,
} from "react-native";
import { Badge } from "./ui/badge";
import { Link, router } from "expo-router";
import SearchBar from "./dashboard/searchBar";
import { useAuthStore } from "@/store/useAuthStore";

interface Category {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  price: string;
  imageUrl: string;
  barcodeUrl: string;
  category: Category;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse {
  success: boolean;
  data: Product[];
}

export default function ProductList() {
  const user = useAuthStore((state) => state.user);

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  const fetchProducts = async () => {
    try {
      const response = await fetch(
        "http://192.168.29.192:3000/api/products/get-all"
      );
      const data: ApiResponse = await response.json();

      if (data.success) {
        setProducts(data.data);
        setError(null);
      } else {
        setError("Failed to load products");
      }
    } catch (err) {
      setError("Unable to connect to server");
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // 🔹 Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500); // wait 500ms after user stops typing

    return () => clearTimeout(handler);
  }, [searchQuery]);

  const formatPrice = (price: string) => {
    return `₹${parseFloat(price).toLocaleString("en-IN")}`;
  };

  const getStockStatus = (quantity: number) => {
    if (quantity === 0)
      return { text: "Out of Stock", color: "text-destructive" };
    if (quantity < 10) return { text: "Low Stock", color: "text-yellow-500" };
    return { text: "In Stock", color: "text-green-500" };
  };

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(debouncedQuery.toLowerCase())
  );

  if (loading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="hsl(var(--primary))" />
        <Text className="text-muted-foreground mt-4">Loading products...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 bg-background items-center justify-center px-6">
        <Text className="text-destructive text-lg font-semibold mb-2">
          Error
        </Text>
        <Text className="text-muted-foreground text-center mb-4">{error}</Text>
        <Pressable
          onPress={fetchProducts}
          className="bg-primary px-6 py-3 rounded-lg active:opacity-80"
        >
          <Text className="text-primary-foreground font-semibold">Retry</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <>
      <SearchBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSearch={() => setDebouncedQuery(searchQuery)} // triggers explicit search
      />

      <View className="flex-1 bg-background">
        {/* Header */}
        <View className="bg-card px-6 pt-6 border-t border-border pb-4">
          <Text className="text-foreground text-2xl font-bold">Products</Text>
          <Text className="text-muted-foreground text-sm mt-1">
            {filteredProducts.length}{" "}
            {filteredProducts.length === 1 ? "item" : "items"} available
          </Text>
        </View>

        {/* Product List - Grid Layout */}
        <View className="flex-1 px-4">
          <View className="flex-row flex-wrap -mx-2">
            {filteredProducts.map((product) => {
              const stockStatus = getStockStatus(product.quantity);

              return (
                <View key={product.id} className="w-1/2 px-2 mb-4">
                  <Pressable
                    onPress={() =>
                      router.push({
                        pathname: "/products/[id]",
                        params: { id: product.id },
                      })
                    }
                    className="bg-card rounded-xl border border-border overflow-hidden active:scale-95 h-[270px]"
                  >
                    {/* Product Image */}
                    <View className="w-full h-40 bg-muted relative">
                      <Image
                        source={{ uri: product.imageUrl }}
                        className="w-full h-full"
                        resizeMode="cover"
                      />

                      {/* Category Badge */}
                      <View className="absolute top-2 left-2">
                        <Badge className="rounded-md px-2 py-1 bg-foreground border border-secondary-foreground">
                          <Text className="text-muted-foreground text-xs">
                            {product.category.name}
                          </Text>
                        </Badge>
                      </View>

                      {/* Quantity Badge */}
                      <View className="absolute top-2 right-2">
                        <Badge className="min-w-5 rounded-md px-2 py-1 bg-foreground border border-secondary-foreground">
                          <Text className="text-muted-foreground text-xs">
                            {product.quantity}
                          </Text>
                        </Badge>
                      </View>
                    </View>

                    {/* Product Info */}
                    <View className="p-3 flex-1 justify-between">
                      <View>
                        <Text
                          className="text-foreground font-semibold text-sm mb-1 h-10"
                          numberOfLines={2}
                        >
                          {product.name}
                        </Text>
                      </View>

                      {/* Price left & SKU right */}
                      <View className="flex-row items-center justify-between">
                        <Text className="text-primary text-base font-bold">
                          {formatPrice(product.price)}
                        </Text>
                        <Badge className="rounded-md px-2 py-1 bg-foreground border border-secondary-foreground">
                          <Text className="text-muted-foreground text-xs">
                            {product.sku}
                          </Text>
                        </Badge>
                      </View>
                    </View>
                  </Pressable>
                </View>
              );
            })}
          </View>

          {/* Empty State */}
          {filteredProducts.length === 0 && (
            <View className="items-center justify-center py-16">
              <Text className="text-muted-foreground text-lg">
                No products found
              </Text>
              <Text className="text-muted-foreground text-sm mt-2">
                Try searching with SKU or title
              </Text>
            </View>
          )}

          <View className="h-6" />
        </View>
      </View>
    </>
  );
}
