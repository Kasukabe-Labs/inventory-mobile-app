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
import { Plus } from "lucide-react-native";
import { useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { API_URL } from "@/constants/api";

interface AddProductProps {
  onProductAdded?: () => void;
}

export function AddProduct({ onProductAdded }: AddProductProps) {
  const user = useAuthStore((state) => state.user);

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    quantity: "",
    price: "",
    imageUrl: "",
    barcodeUrl: "",
    categoryId: "",
  });

  const resetForm = () => {
    setFormData({
      name: "",
      sku: "",
      quantity: "",
      price: "",
      imageUrl: "",
      barcodeUrl: "",
      categoryId: "",
    });
  };

  const handleSubmit = async () => {
    // Validation
    if (
      !formData.name ||
      !formData.sku ||
      !formData.price ||
      !formData.barcodeUrl ||
      !formData.categoryId
    ) {
      Alert.alert(
        "Error",
        "Please fill in all required fields (Name, SKU, Price, Barcode URL, Category ID)"
      );
      return;
    }

    setLoading(true);
    try {
      const token = user?.token;

      if (!token) {
        Alert.alert("Error", "You must be logged in to add products");
        return;
      }

      const response = await fetch(`${API_URL}/api/products/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          sku: formData.sku,
          quantity: formData.quantity ? parseInt(formData.quantity) : 0,
          price: parseFloat(formData.price),
          imageUrl: formData.imageUrl || undefined,
          barcodeUrl: formData.barcodeUrl,
          categoryId: formData.categoryId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to add product");
      }

      Alert.alert("Success", "Product added successfully!");
      resetForm();
      setOpen(false);
      onProductAdded?.();
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to add product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Text>Add Product</Text>
          <Icon as={Plus} size={20} />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
          <DialogDescription>
            Fill in the product details below. Fields marked with * are
            required.
          </DialogDescription>
        </DialogHeader>
        <ScrollView className="max-h-[400px]">
          <View className="grid gap-4 py-4">
            <View className="grid gap-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                placeholder="Enter product name"
                value={formData.name}
                onChangeText={(text) =>
                  setFormData({ ...formData, name: text })
                }
              />
            </View>

            <View className="grid gap-2">
              <Label htmlFor="sku">SKU *</Label>
              <Input
                id="sku"
                placeholder="Enter SKU (must be unique)"
                value={formData.sku}
                onChangeText={(text) => setFormData({ ...formData, sku: text })}
              />
            </View>

            <View className="grid gap-2">
              <Label htmlFor="price">Price *</Label>
              <Input
                id="price"
                placeholder="0.00"
                keyboardType="decimal-pad"
                value={formData.price}
                onChangeText={(text) =>
                  setFormData({ ...formData, price: text })
                }
              />
            </View>

            <View className="grid gap-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                placeholder="0"
                keyboardType="number-pad"
                value={formData.quantity}
                onChangeText={(text) =>
                  setFormData({ ...formData, quantity: text })
                }
              />
            </View>

            <View className="grid gap-2">
              <Label htmlFor="barcodeUrl">Barcode URL *</Label>
              <Input
                id="barcodeUrl"
                placeholder="Enter barcode URL"
                value={formData.barcodeUrl}
                onChangeText={(text) =>
                  setFormData({ ...formData, barcodeUrl: text })
                }
              />
            </View>

            <View className="grid gap-2">
              <Label htmlFor="imageUrl">Image URL</Label>
              <Input
                id="imageUrl"
                placeholder="Enter product image URL (optional)"
                value={formData.imageUrl}
                onChangeText={(text) =>
                  setFormData({ ...formData, imageUrl: text })
                }
              />
            </View>

            <View className="grid gap-2">
              <Label htmlFor="categoryId">Category ID *</Label>
              <Input
                id="categoryId"
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
            <Text>{loading ? "Adding..." : "Add Product"}</Text>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
