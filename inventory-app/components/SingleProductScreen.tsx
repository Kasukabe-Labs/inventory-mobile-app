import {
  View,
  ScrollView,
  Image,
  ActivityIndicator,
  Pressable,
  RefreshControl,
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

const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://192.168.29.192:3000";

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
        <Text className="text-muted-foreground mt-4">Loading product...</Text>
      </View>
    );
  }

  if (!product) {
    return (
      <View className="flex-1 bg-background items-center justify-center p-6">
        <Icon as={Package} size={64} className="text-muted-foreground mb-4" />
        <Text className="text-foreground text-xl font-bold mb-2">
          Product Not Found
        </Text>
        <Text className="text-muted-foreground text-center mb-6">
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

          {isAdmin && (
            <View className="flex-row gap-2">
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
      </View>

      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Product Image */}
        <View className="w-full h-[400px] bg-muted relative">
          <Image
            source={{
              uri: product.imageUrl || "https://via.placeholder.com/400",
            }}
            className="w-full h-full"
            resizeMode="cover"
          />

          {/* Category Badge (Top Left) */}
          <View className="absolute top-4 left-4">
            <Badge className="rounded-lg px-3 py-2 bg-card/90 backdrop-blur border border-border shadow-lg">
              <Text className="text-foreground text-sm font-medium">
                {product.category.name}
              </Text>
            </Badge>
          </View>

          {/* Quantity Badge (Top Right) */}
          <View className="absolute top-4 right-4">
            <Badge
              className={`rounded-lg px-3 py-2 backdrop-blur border shadow-lg ${
                product.quantity > 50
                  ? "bg-green-500/90 border-green-600"
                  : product.quantity > 10
                    ? "bg-yellow-500/90 border-yellow-600"
                    : "bg-red-500/90 border-red-600"
              }`}
            >
              <Text className="text-white text-sm font-bold">
                {product.quantity} in stock
              </Text>
            </Badge>
          </View>
        </View>

        {/* Product Details */}
        <View className="p-6">
          {/* Product Name & Price */}
          <View className="mb-6">
            <Text className="text-foreground text-3xl font-bold mb-3">
              {product.name}
            </Text>
            <Text className="text-primary text-4xl font-extrabold">
              {formatPrice(product.price)}
            </Text>
          </View>
          {/* Info Cards */}
          <View className="gap-4 mb-6">
            {/* SKU Card */}
            <View className="bg-card rounded-xl border border-border p-4">
              <View className="flex-row items-center mb-2">
                <Icon
                  as={Tag}
                  size={20}
                  className="text-muted-foreground mr-2"
                />
                <Text className="text-muted-foreground text-sm font-medium">
                  SKU
                </Text>
              </View>
              <Text className="text-foreground text-lg font-semibold">
                {product.sku}
              </Text>
            </View>

            {/* Barcode Card */}
            <View className="bg-card rounded-xl border border-border p-4">
              <View className="flex-row items-center mb-3">
                <Icon
                  as={Barcode}
                  size={20}
                  className="text-muted-foreground mr-2"
                />
                <Text className="text-muted-foreground text-sm font-medium">
                  Barcode
                </Text>
              </View>
              <View className="bg-white rounded-lg p-3 items-center">
                <Image
                  source={{ uri: product.barcodeUrl }}
                  className="w-full h-24"
                  resizeMode="contain"
                />
              </View>
            </View>

            {/* Stock Status Card */}
            <View className="bg-card rounded-xl border border-border p-4">
              <View className="flex-row items-center mb-2">
                <Icon
                  as={Package}
                  size={20}
                  className="text-muted-foreground mr-2"
                />
                <Text className="text-muted-foreground text-sm font-medium">
                  Stock Status
                </Text>
              </View>
              <View className="flex-row items-center justify-between">
                <Text className="text-foreground text-lg font-semibold">
                  {product.quantity} units available
                </Text>
                <Badge
                  className={`rounded-md px-3 py-1 ${
                    product.quantity > 50
                      ? "bg-green-500/20 border-green-500"
                      : product.quantity > 10
                        ? "bg-yellow-500/20 border-yellow-500"
                        : "bg-red-500/20 border-red-500"
                  }`}
                >
                  <Text
                    className={`text-sm font-semibold ${
                      product.quantity > 50
                        ? "text-green-700"
                        : product.quantity > 10
                          ? "text-yellow-700"
                          : "text-red-700"
                    }`}
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

            {/* Timestamps Card */}
            <View className="bg-card rounded-xl border border-border p-4">
              <View className="flex-row items-center mb-3">
                <Icon
                  as={Calendar}
                  size={20}
                  className="text-muted-foreground mr-2"
                />
                <Text className="text-muted-foreground text-sm font-medium">
                  Product Information
                </Text>
              </View>
              <View className="gap-2">
                <View className="flex-row justify-between">
                  <Text className="text-muted-foreground">Created</Text>
                  <Text className="text-foreground font-medium">
                    {formatDate(product.createdAt)}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-muted-foreground">Last Updated</Text>
                  <Text className="text-foreground font-medium">
                    {formatDate(product.updatedAt)}
                  </Text>
                </View>
              </View>
            </View>
          </View>
          {/* <View className="bg-muted/50 rounded-xl p-4 border border-border">
            <Text className="text-muted-foreground text-sm mb-1">Category</Text>
            <Text className="text-foreground text-xl font-bold">
              {product.category.name}
            </Text>
            <Text className="text-muted-foreground text-xs mt-1">
              ID: {product.categoryId}
            </Text>
          </View> */}
          {/* Bottom Spacing */}
          <View className="h-8" />
        </View>
      </ScrollView>
    </View>
  );
}
