import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { router } from "expo-router";
import SearchBar from "./dashboard/searchBar";
import { useAuthStore } from "@/store/useAuthStore";
import { API_URL } from "@/constants/api";
import { useCategoryStore } from "@/store/useCategoryStore";
import Feather from "@expo/vector-icons/Feather";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { UpdateProduct } from "./dashboard/updateProductDialog";
import { DeleteProduct } from "./dashboard/deleteProduct";
import QuantityDialog from "./Quantity";

interface Category {
  id: string;
  name: string;
}

export interface Product {
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
  const setCategories = useCategoryStore((state) => state.setCategories);

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null
  );

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_URL}/api/products/get-all`);
      const data: ApiResponse = await response.json();

      if (data.success) {
        setProducts(data.data);
        const uniqueCategories: Category[] = Array.from(
          new Map(data.data.map((p) => [p.category.id, p.category])).values()
        );
        setCategories(uniqueCategories);
        setError(null);
      } else {
        setError("Failed to load products");
      }
    } catch (err) {
      setError("Unable to connect to server");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  const formatPrice = (price: string) => {
    return `₹${parseFloat(price).toLocaleString("en-IN")}`;
  };

  const getStockStatus = (quantity: number) => {
    if (quantity === 0) return { text: "Out of Stock", color: "#dc2626" };
    if (quantity < 10) return { text: "Low Stock", color: "#f59e0b" };
    return { text: "In Stock", color: "#10b981" };
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(debouncedQuery.toLowerCase());

    const matchesCategory =
      !selectedCategoryId || product.category.id === selectedCategoryId;

    return matchesSearch && matchesCategory;
  });

  const resetSearch = () => {
    setSearchQuery("");
    setDebouncedQuery("");
    setSelectedCategoryId(null);
  };

  const handleProductUpdated = () => {
    fetchProducts();
  };

  const handleProductDeleted = () => {
    fetchProducts();
  };

  const handleQuantityUpdated = (productId: string, newQuantity: number) => {
    setProducts((prevProducts) =>
      prevProducts.map((product) =>
        product.id === productId
          ? { ...product, quantity: newQuantity }
          : product
      )
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Loading products...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorTitle}>Error</Text>
        <Text style={styles.errorMessage}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchProducts}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <>
      <SearchBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSearch={() => setDebouncedQuery(searchQuery)}
        resetFilters={resetSearch}
        selectedCategoryId={selectedCategoryId}
        setSelectedCategoryId={setSelectedCategoryId}
      />

      <ScrollView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Products</Text>
          <Text style={styles.headerSubtitle}>
            {filteredProducts.length}{" "}
            {filteredProducts.length === 1 ? "item" : "items"}
          </Text>
        </View>

        {/* Product Grid */}
        <View style={styles.grid}>
          {filteredProducts.map((product) => {
            const stockStatus = getStockStatus(product.quantity);

            return (
              <View key={product.id} style={styles.gridItem}>
                <TouchableOpacity
                  style={styles.productCard}
                  activeOpacity={0.7}
                >
                  {/* Product Image */}
                  <View style={styles.imageContainer}>
                    <Image
                      source={{ uri: product.imageUrl }}
                      style={styles.productImage}
                      resizeMode="cover"
                    />

                    {/* Stock Badge */}
                    <View
                      style={[
                        styles.stockBadge,
                        { backgroundColor: stockStatus.color },
                      ]}
                    >
                      <Text style={styles.stockBadgeText}>
                        {product.quantity}
                      </Text>
                    </View>
                  </View>

                  {/* Product Info */}
                  <View style={styles.productInfo}>
                    <Text style={styles.categoryBadge}>
                      {product.category.name}
                    </Text>

                    <Text style={styles.productName} numberOfLines={2}>
                      {product.name}
                    </Text>

                    <View style={styles.priceRow}>
                      <Text style={styles.productPrice}>
                        {formatPrice(product.price)}
                      </Text>
                      <Text style={styles.productSku}>#{product.sku}</Text>
                    </View>

                    {/* Action Buttons */}
                    {user?.role === "ADMIN" && (
                      <View style={styles.actionButtons}>
                        <QuantityDialog
                          id={product.id}
                          currentQuantity={product.quantity}
                          onQuantityUpdated={(newQuantity) =>
                            handleQuantityUpdated(product.id, newQuantity)
                          }
                        />
                        <UpdateProduct
                          product={product}
                          onProductUpdated={handleProductUpdated}
                        />
                        <DeleteProduct
                          productId={product.id}
                          productName={product.name}
                          onProductDeleted={handleProductDeleted}
                        />
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>No products found</Text>
            <Text style={styles.emptyStateSubtitle}>
              Try searching with SKU or title
            </Text>
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </>
  );
}

export const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6b7280",
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#dc2626",
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#6b7280",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 10,
  },
  gridItem: {
    width: "50%",
    padding: 6,
  },
  productCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  imageContainer: {
    width: "100%",
    aspectRatio: 1,
    backgroundColor: "#f3f4f6",
    position: "relative",
  },
  productImage: {
    width: "100%",
    height: "100%",
  },
  stockBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  stockBadgeText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "700",
  },
  productInfo: {
    padding: 12,
  },
  categoryBadge: {
    fontSize: 11,
    fontWeight: "600",
    color: "#2563eb",
    backgroundColor: "#dbeafe",
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginBottom: 8,
    textTransform: "uppercase",
  },
  productName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 8,
    minHeight: 38,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1f2937",
  },
  productSku: {
    fontSize: 12,
    fontWeight: "500",
    color: "#6b7280",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  actionButton: {
    flex: 1,
    backgroundColor: "#f9fafb",
    padding: 8,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 64,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: "#6b7280",
  },
  bottomSpacer: {
    height: 24,
  },
});
