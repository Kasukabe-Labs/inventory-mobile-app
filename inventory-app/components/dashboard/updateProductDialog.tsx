import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Text } from "@/components/ui/text";
import { View, ScrollView, Alert } from "react-native";
import { Icon } from "../ui/icon";
import { Pencil } from "lucide-react-native";
import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";

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
}

interface UpdateProductProps {
  product: Product;
  onProductUpdated?: () => void;
  trigger?: React.ReactNode;
}

export function UpdateProduct({
  product,
  onProductUpdated,
  trigger,
}: UpdateProductProps) {
  const user = useAuthStore((state) => state.user);

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: product.name,
    sku: product.sku,
    quantity: product.quantity.toString(),
    price: product.price.toString(),
    imageUrl: product.imageUrl || "",
    barcodeUrl: product.barcodeUrl,
    categoryId: product.categoryId,
  });

  // Update form when product changes
  useEffect(() => {
    setFormData({
      name: product.name,
      sku: product.sku,
      quantity: product.quantity.toString(),
      price: product.price.toString(),
      imageUrl: product.imageUrl || "",
      barcodeUrl: product.barcodeUrl,
      categoryId: product.categoryId,
    });
  }, [product]);

  const handleSubmit = async () => {
    // Validation
    if (
      !formData.name ||
      !formData.sku ||
      !formData.price ||
      !formData.barcodeUrl ||
      !formData.categoryId
    ) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      const token = user?.token;
      if (!token) {
        Alert.alert("Error", "You must be logged in to update products");
        return;
      }

      const response = await fetch(
        `${API_URL}/api/products/update/${product.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: formData.name,
            sku: formData.sku,
            quantity: parseInt(formData.quantity),
            price: parseFloat(formData.price),
            imageUrl: formData.imageUrl || undefined,
            barcodeUrl: formData.barcodeUrl,
            categoryId: formData.categoryId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update product");
      }

      Alert.alert("Success", "Product updated successfully!");
      setOpen(false);
      onProductUpdated?.();
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to update product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Icon as={Pencil} size={16} className="text-foreground" />
            <Text>Edit</Text>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Update Product</DialogTitle>
          <DialogDescription>
            Make changes to the product details. Fields marked with * are
            required.
          </DialogDescription>
        </DialogHeader>
        <ScrollView className="max-h-[400px]">
          <View className="grid gap-4 py-4">
            <View className="grid gap-2">
              <Label htmlFor="update-name">Product Name *</Label>
              <Input
                id="update-name"
                placeholder="Enter product name"
                value={formData.name}
                onChangeText={(text) =>
                  setFormData({ ...formData, name: text })
                }
              />
            </View>

            <View className="grid gap-2">
              <Label htmlFor="update-sku">SKU *</Label>
              <Input
                id="update-sku"
                placeholder="Enter SKU"
                value={formData.sku}
                onChangeText={(text) => setFormData({ ...formData, sku: text })}
              />
            </View>

            <View className="grid gap-2">
              <Label htmlFor="update-price">Price *</Label>
              <Input
                id="update-price"
                placeholder="0.00"
                keyboardType="decimal-pad"
                value={formData.price}
                onChangeText={(text) =>
                  setFormData({ ...formData, price: text })
                }
              />
            </View>

            <View className="grid gap-2">
              <Label htmlFor="update-quantity">Quantity *</Label>
              <Input
                id="update-quantity"
                placeholder="0"
                keyboardType="number-pad"
                value={formData.quantity}
                onChangeText={(text) =>
                  setFormData({ ...formData, quantity: text })
                }
              />
            </View>

            <View className="grid gap-2">
              <Label htmlFor="update-barcodeUrl">Barcode URL *</Label>
              <Input
                id="update-barcodeUrl"
                placeholder="Enter barcode URL"
                value={formData.barcodeUrl}
                onChangeText={(text) =>
                  setFormData({ ...formData, barcodeUrl: text })
                }
              />
            </View>

            <View className="grid gap-2">
              <Label htmlFor="update-imageUrl">Image URL</Label>
              <Input
                id="update-imageUrl"
                placeholder="Enter product image URL (optional)"
                value={formData.imageUrl}
                onChangeText={(text) =>
                  setFormData({ ...formData, imageUrl: text })
                }
              />
            </View>

            <View className="grid gap-2">
              <Label htmlFor="update-categoryId">Category ID *</Label>
              <Input
                id="update-categoryId"
                placeholder="Enter category ID"
                value={formData.categoryId}
                onChangeText={(text) =>
                  setFormData({ ...formData, categoryId: text })
                }
              />
            </View>
          </View>
        </ScrollView>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={loading}>
              <Text>Cancel</Text>
            </Button>
          </DialogClose>
          <Button onPress={handleSubmit} disabled={loading}>
            <Text>{loading ? "Updating..." : "Save Changes"}</Text>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
