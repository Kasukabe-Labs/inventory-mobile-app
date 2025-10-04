import {
  View,
  ScrollView,
  Image,
  ActivityIndicator,
  Pressable,
  RefreshControl,
  useColorScheme,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState, useEffect, useCallback } from "react";
import { Text } from "@/components/ui/text";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import {
  ArrowLeft,
  Package,
  Barcode,
  Calendar,
  Tag,
} from "lucide-react-native";
import { useAuthStore } from "@/store/useAuthStore";
import { UpdateProduct } from "./dashboard/updateProductDialog";
import { DeleteProduct } from "./dashboard/deleteProduct";
import { API_URL } from "@/constants/api";
import QuantityDialog from "./Quantity";

interface Product {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  price: number;
  imageUrl?: string;
  barcodeUrl: string;
  categoryId: string;
  createdAt: string;
  updatedAt: string;
  category: {
    id: string;
    name: string;
  };
}

export default function SingleProductScreen() {
  const user = useAuthStore((state) => state.user);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const fetchProduct = async () => {
    try {
      const response = await fetch(`${API_URL}/api/products/get/${id}`);
      const data = await response.json();

      if (data.success) {
        const foundProduct = data.data;
        if (foundProduct) {
          setProduct(foundProduct);
        } else {
          // Product not found
          setProduct(null);
        }
      }
    } catch (error) {
      console.error("Error fetching product:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const checkAdminStatus = async () => {
    // Check if user is admin - adjust based on your auth implementation
    const userRole = user?.role;
    setIsAdmin(userRole === "ADMIN");
  };

  // Handle quantity update
  const handleQuantityUpdate = (productId: string, newQuantity: number) => {
    if (product && product.id === productId) {
      setProduct({
        ...product,
        quantity: newQuantity,
      });
    }
  };

  useEffect(() => {
    fetchProduct();
    checkAdminStatus();
  }, [id]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchProduct();
  }, []);

  const handleProductUpdated = () => {
    fetchProduct();
  };

  const handleProductDeleted = () => {
    router.back();
  };

  if (loading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#007AFF" />
        <Text className={`mt-4 ${isDark ? "text-white" : "text-black"}`}>
          Loading product...
        </Text>
      </View>
    );
  }

  if (!product) {
    return (
      <View className="flex-1 bg-background items-center justify-center p-6">
        <Icon as={Package} size={64} className="text-muted-foreground mb-4" />
        <Text
          className={`text-xl font-bold mb-2 ${isDark ? "text-white" : "text-black"}`}
        >
          Product Not Found
        </Text>
        <Text
          className={`text-center mb-6 ${isDark ? "text-white" : "text-black"}`}
        >
          The product you're looking for doesn't exist or has been removed.
        </Text>
        <Button onPress={() => router.back()}>
          <Text>Go Back</Text>
        </Button>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="bg-card border-b border-border px-4 pt-12 pb-4">
        <View className="flex-row items-center justify-between">
          <Pressable
            onPress={() => router.back()}
            className="active:opacity-70"
          >
            <Icon as={ArrowLeft} size={24} className="text-foreground" />
          </Pressable>

          <View className="flex-row gap-2">
            {isAdmin && (
              <>
                <UpdateProduct
                  product={product}
                  onProductUpdated={handleProductUpdated}
                />
                <DeleteProduct
                  productId={product.id}
                  productName={product.name}
                  onProductDeleted={handleProductDeleted}
                />
              </>
            )}
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Product Image */}
        <View className="w-full aspect-square bg-muted relative">
          <Image
            source={{
              uri: product.imageUrl || "https://via.placeholder.com/400",
            }}
            className="w-full h-full"
            resizeMode="cover"
          />

          {/* Category Badge (Top Left) */}
          <View className="absolute top-4 left-4">
            <Badge
              variant="secondary"
              className="rounded-lg px-3 py-2 shadow-sm"
            >
              <Text
                className={`text-sm font-medium ${isDark ? "text-white" : "text-black"}`}
              >
                {product.category.name}
              </Text>
            </Badge>
          </View>

          {/* Quantity Badge (Top Right) */}
          <View className="absolute top-4 right-4">
            <Badge
              variant="secondary"
              className="rounded-lg px-3 py-2 shadow-sm"
            >
              <Text
                className={`text-sm font-semibold ${isDark ? "text-white" : "text-black"}`}
              >
                {product.quantity} in stock
              </Text>
            </Badge>
          </View>
        </View>

        {/* Product Details */}
        <View className="px-5 py-6">
          {/* Product Name & Price */}
          <View className="mb-8">
            <Text
              className={`text-2xl font-bold mb-3 leading-7 ${isDark ? "text-white" : "text-black"}`}
            >
              {product.name}
            </Text>

            <Text
              className={`text-3xl font-bold mb-4 ${isDark ? "text-white" : "text-black"}`}
            >
              {formatPrice(product.price)}
            </Text>

            <QuantityDialog
              currentQuantity={product.quantity}
              productId={product.id}
              onQuantityUpdated={(newQuantity) =>
                handleQuantityUpdate(product.id, newQuantity)
              }
            />
          </View>

          {/* Info Cards */}
          <View className="gap-3 mb-6">
            {/* SKU Card */}
            <View className="bg-card rounded-xl border border-border p-4">
              <View className="flex-row items-center mb-2">
                <Icon
                  as={Tag}
                  size={18}
                  className="text-muted-foreground mr-2"
                />
                <Text
                  className={`text-xs font-medium uppercase tracking-wide ${isDark ? "text-white" : "text-black"}`}
                >
                  SKU
                </Text>
              </View>
              <Text
                className={`text-base font-semibold ${isDark ? "text-white" : "text-black"}`}
              >
                {product.sku}
              </Text>
            </View>

            {/* Stock Status Card */}
            <View className="bg-card rounded-xl border border-border p-4">
              <View className="flex-row items-center mb-3">
                <Icon
                  as={Package}
                  size={18}
                  className="text-muted-foreground mr-2"
                />
                <Text
                  className={`text-xs font-medium uppercase tracking-wide ${isDark ? "text-white" : "text-black"}`}
                >
                  Stock Status
                </Text>
              </View>
              <View className="flex-row items-center justify-between">
                <Text
                  className={`text-base font-semibold ${isDark ? "text-white" : "text-black"}`}
                >
                  {product.quantity} units
                </Text>
                <Badge variant="secondary" className="rounded-md px-3 py-1.5">
                  <Text
                    className={`text-xs font-semibold ${isDark ? "text-white" : "text-black"}`}
                  >
                    {product.quantity > 50
                      ? "In Stock"
                      : product.quantity > 10
                        ? "Low Stock"
                        : "Very Low"}
                  </Text>
                </Badge>
              </View>
            </View>

            {/* Barcode Card */}
            <View className="bg-card rounded-xl border border-border p-4">
              <View className="flex-row items-center mb-3">
                <Icon
                  as={Barcode}
                  size={18}
                  className="text-muted-foreground mr-2"
                />
                <Text
                  className={`text-xs font-medium uppercase tracking-wide ${isDark ? "text-white" : "text-black"}`}
                >
                  Barcode
                </Text>
              </View>
              <View className="bg-muted rounded-lg p-4 items-center">
                <Image
                  source={{ uri: product.barcodeUrl }}
                  className="w-full h-20"
                  resizeMode="contain"
                />
              </View>
            </View>
          </View>

          {/* Bottom Spacing */}
          <View className="h-8" />
        </View>
      </ScrollView>
    </View>
  );
}
