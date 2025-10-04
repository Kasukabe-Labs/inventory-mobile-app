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
import { useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { API_URL } from "@/constants/api";
import { useCategoryStore } from "@/store/useCategoryStore";
import { BarcodeGeneratorField } from "../BarcodeGeneratorField";
import { ImageUploadField } from "../ImageUploader";
import { NativeCategoryDropdown } from "../NativeCategoryDropdown"; // Import your component
import Feather from "@expo/vector-icons/Feather";

interface AddProductProps {
  onProductAdded?: () => void;
}

export function AddProduct({ onProductAdded }: AddProductProps) {
  const user = useAuthStore((state) => state.user);
  const categories = useCategoryStore((state) => state.categories);

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    quantity: "",
    price: "",
    categoryId: "",
  });
  const [imageData, setImageData] = useState<{
    uri: string;
    name: string;
    type: string;
  } | null>(null);
  const [barcodeGenerated, setBarcodeGenerated] = useState(false);

  const resetForm = () => {
    setFormData({
      name: "",
      sku: "",
      quantity: "",
      price: "",
      categoryId: "",
    });
    setImageData(null);
    setBarcodeGenerated(false);
  };

  const handleSubmit = async () => {
    if (
      !formData.name ||
      !formData.sku ||
      !formData.price ||
      !formData.categoryId
    ) {
      Alert.alert(
        "Error",
        "Please fill in all required fields (Name, SKU, Price, Category)"
      );
      return;
    }

    if (!barcodeGenerated) {
      Alert.alert("Error", "Please generate a barcode before submitting");
      return;
    }

    setLoading(true);
    try {
      const token = user?.token;
      if (!token) {
        Alert.alert("Error", "You must be logged in to add products");
        return;
      }

      // Create FormData for multipart/form-data
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("sku", formData.sku);
      formDataToSend.append("quantity", formData.quantity || "0");
      formDataToSend.append("price", formData.price);
      formDataToSend.append("categoryId", formData.categoryId);

      // Append image if selected
      if (imageData) {
        formDataToSend.append("image", {
          uri: imageData.uri,
          name: imageData.name,
          type: imageData.type,
        } as any);
      }

      const response = await fetch(`${API_URL}/api/products/add`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
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
        <Button className="h-12" variant={"secondary"}>
          <Feather name="plus" size={20} color={"black"} />
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
                onChangeText={(text) => {
                  setFormData({ ...formData, sku: text });
                  setBarcodeGenerated(false);
                }}
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

            <BarcodeGeneratorField
              price={parseFloat(formData.price)}
              quantity={parseInt(formData.quantity)}
              sku={formData.sku}
              onBarcodeGenerated={() => setBarcodeGenerated(true)}
            />

            <ImageUploadField
              label="Product Image"
              value={imageData?.uri || null}
              onImageSelected={setImageData}
            />

            {/* Replaced category section with NativeCategoryDropdown */}
            <View className="grid gap-2">
              <NativeCategoryDropdown
                label="Category *"
                value={formData.categoryId}
                onValueChange={(categoryId) =>
                  setFormData({ ...formData, categoryId })
                }
                categories={categories}
                placeholder="Select a category"
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
