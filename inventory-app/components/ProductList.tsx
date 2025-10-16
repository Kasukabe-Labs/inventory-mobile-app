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
  Modal,
  Pressable,
  useColorScheme,
  Animated,
} from "react-native";
import SearchBar from "./dashboard/searchBar";
import { useAuthStore } from "@/store/useAuthStore";
import { API_URL } from "@/constants/api";
import { useCategoryStore } from "@/store/useCategoryStore";
import Feather from "@expo/vector-icons/Feather";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { UpdateProduct } from "./dashboard/updateProductDialog";
import { DeleteProduct } from "./dashboard/deleteProduct";
import QuantityDialog from "./Quantity";
import { SkeletonLoader } from "./SkeletonLoader";
import { useQueryClient } from "@tanstack/react-query";
import { useProducts, Product, Category } from "@/hooks/useProducts";

export default function ProductList() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const theme = {
    background: isDark ? "#0f172a" : "#ffffff",
    card: isDark ? "#1e293b" : "#ffffff",
    textPrimary: isDark ? "#f1f5f9" : "#1f2937",
    textSecondary: isDark ? "#94a3b8" : "#6b7280",
    border: isDark ? "#334155" : "#e5e7eb",
  };

  const user = useAuthStore((state) => state.user);
  const setCategories = useCategoryStore((state) => state.setCategories);

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null
  );
  const [barcodeModalVisible, setBarcodeModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const queryClient = useQueryClient();

  const {
    data: products = [],
    isLoading: loading,
    error,
    refetch,
  } = useProducts();

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    if (products && products.length > 0) {
      const uniqueCategories: Category[] = Array.from(
        new Map(products.map((p) => [p.category.id, p.category])).values()
      );
      setCategories(uniqueCategories);
    }
  }, [products, setCategories]);

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
    queryClient.invalidateQueries({ queryKey: ["products"] });
  };

  const handleProductDeleted = () => {
    queryClient.invalidateQueries({ queryKey: ["products"] });
  };

  // Keep handleQuantityUpdated as is for optimistic updates, but add:
  const handleQuantityUpdated = (productId: string, newQuantity: number) => {
    // Optimistic update
    queryClient.setQueryData(["products"], (oldData: Product[] | undefined) => {
      if (!oldData) return oldData;
      return oldData.map((product) =>
        product.id === productId
          ? { ...product, quantity: newQuantity }
          : product
      );
    });

    // Invalidate to refetch in background
    queryClient.invalidateQueries({ queryKey: ["products"] });
  };

  const handleBarcodePress = (product: Product) => {
    setSelectedProduct(product);
    setBarcodeModalVisible(true);
  };

  const closeBarcodeModal = () => {
    setBarcodeModalVisible(false);
    setSelectedProduct(null);
  };

  if (loading) {
    return <SkeletonLoader />;
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorTitle}>Error</Text>
        <Text style={styles.errorMessage}>
          {error instanceof Error
            ? error.message
            : "Unable to connect to server"}
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
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

        {/* Product List */}
        <View style={styles.listContainer}>
          {filteredProducts.map((product) => {
            const stockStatus = getStockStatus(product.quantity);

            return (
              <View key={product.id} style={styles.productCard}>
                {/* Product Image */}
                <View style={styles.productImageWrapper}>
                  <Image
                    source={{ uri: product.imageUrl }}
                    style={styles.productImage}
                    resizeMode="cover"
                  />
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

                {/* Product Details */}
                <View style={styles.productDetails}>
                  <View style={styles.productHeader}>
                    <View style={styles.productHeaderLeft}>
                      <Text style={styles.categoryBadge}>
                        {product.category.name}
                      </Text>
                      <Text style={styles.productName} numberOfLines={2}>
                        {product.name}
                      </Text>
                      <Text style={styles.productSku}>SKU: #{product.sku}</Text>
                    </View>
                    <View style={styles.productHeaderRight}>
                      <Text style={styles.productPrice}>
                        {formatPrice(product.price)}
                      </Text>
                      <View
                        style={[
                          styles.stockStatusBadge,
                          { backgroundColor: `${stockStatus.color}15` },
                        ]}
                      >
                        <View
                          style={[
                            styles.stockStatusDot,
                            { backgroundColor: stockStatus.color },
                          ]}
                        />
                        <Text
                          style={[
                            styles.stockStatusText,
                            { color: stockStatus.color },
                          ]}
                        >
                          {stockStatus.text}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Action Buttons */}
                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleBarcodePress(product)}
                      activeOpacity={0.7}
                    >
                      <MaterialIcons
                        name="qr-code-2"
                        size={16}
                        color="#2563eb"
                      />
                    </TouchableOpacity>

                    <View style={styles.actionButtonWrapper}>
                      <QuantityDialog
                        id={product.id}
                        currentQuantity={product.quantity}
                        onQuantityUpdated={(newQuantity) =>
                          handleQuantityUpdated(product.id, newQuantity)
                        }
                      />
                    </View>

                    {user?.role === "ADMIN" && (
                      <>
                        <View style={styles.actionButtonWrapper}>
                          <UpdateProduct
                            product={product}
                            onProductUpdated={handleProductUpdated}
                          />
                        </View>
                        <View style={styles.actionButtonWrapper}>
                          <DeleteProduct
                            productId={product.id}
                            productName={product.name}
                            onProductDeleted={handleProductDeleted}
                          />
                        </View>
                      </>
                    )}
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <View style={styles.emptyState}>
            <MaterialIcons name="inventory-2" size={64} color="#e5e7eb" />
            <Text style={styles.emptyStateTitle}>No products found</Text>
            <Text style={styles.emptyStateSubtitle}>
              Try searching with SKU or title
            </Text>
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Barcode Modal */}
      <Modal
        visible={barcodeModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeBarcodeModal}
      >
        <Pressable style={styles.modalOverlay} onPress={closeBarcodeModal}>
          <Pressable
            style={styles.modalContent}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderText}>
                <Text style={styles.modalTitle} numberOfLines={2}>
                  {selectedProduct?.name}
                </Text>
                <Text style={styles.modalSubtitle}>
                  SKU: #{selectedProduct?.sku}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={closeBarcodeModal}
                activeOpacity={0.7}
              >
                <Feather name="x" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            {/* Barcode Image */}
            <View style={styles.barcodeImageContainer}>
              {selectedProduct?.barcodeUrl ? (
                <Image
                  source={{ uri: selectedProduct.barcodeUrl }}
                  style={styles.barcodeImage}
                  resizeMode="contain"
                />
              ) : (
                <View style={styles.noBarcodeContainer}>
                  <MaterialIcons name="qr-code-2" size={64} color="#e5e7eb" />
                  <Text style={styles.noBarcodeText}>No barcode available</Text>
                </View>
              )}
            </View>

            {/* Modal Footer */}
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.closeModalButton}
                onPress={closeBarcodeModal}
                activeOpacity={0.7}
              >
                <Text style={styles.closeModalButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

export const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 14,
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
  listContainer: {
    padding: 12,
    gap: 12,
  },
  productCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    flexDirection: "row",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  productImageWrapper: {
    width: 120,
    height: 160,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    overflow: "hidden",
    backgroundColor: "#f3f4f6",
  },
  productImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  stockBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  stockBadgeText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "700",
  },
  productDetails: {
    flex: 1,
    padding: 12,
    justifyContent: "space-between",
  },
  productHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  productHeaderLeft: {
    flex: 1,
    marginRight: 12,
  },
  productHeaderRight: {
    alignItems: "flex-end",
  },
  categoryBadge: {
    fontSize: 10,
    fontWeight: "600",
    color: "#2563eb",
    backgroundColor: "#dbeafe",
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  productName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 4,
    lineHeight: 20,
  },
  productSku: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "500",
  },
  productPrice: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 6,
  },
  stockStatusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  stockStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  stockStatusText: {
    fontSize: 11,
    fontWeight: "600",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 6,
    flexWrap: "wrap",
  },
  actionButton: {
    flex: 1,
    backgroundColor: "#f9fafb",
    padding: 8,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#2563eb",
  },
  actionButtonWrapper: {
    flex: 1,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: "#6b7280",
  },
  bottomSpacer: {
    height: 24,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    width: "100%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  modalHeaderText: {
    flex: 1,
    marginRight: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "500",
  },
  closeButton: {
    padding: 4,
  },
  barcodeImageContainer: {
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 300,
  },
  barcodeImage: {
    width: "100%",
    height: 250,
  },
  noBarcodeContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  noBarcodeText: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 12,
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  closeModalButton: {
    backgroundColor: "#2563eb",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
  },
  closeModalButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});
