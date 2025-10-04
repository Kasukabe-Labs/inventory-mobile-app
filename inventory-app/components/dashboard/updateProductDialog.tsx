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
import { View, ScrollView, Alert, Pressable } from "react-native";
import { Icon } from "../ui/icon";
import { Pencil } from "lucide-react-native";
import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { API_URL } from "@/constants/api";
import { useCategoryStore } from "@/store/useCategoryStore";
import { ImageUploadField } from "../ImageUploader";
import { BarcodeGeneratorField } from "../BarcodeGeneratorField";

interface Product {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  price: number;
  imageUrl?: string;
  barcodeUrl: string;
  category: Category;
}

interface Category {
  id: string;
  name: string;
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
  const categories = useCategoryStore((state) => state.categories);

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: product.name,
    sku: product.sku,
    quantity: product.quantity.toString(),
    price: product.price.toString(),
    barcodeUrl: product.barcodeUrl,
    categoryId: product.category.id,
  });
  const [imageData, setImageData] = useState<{
    uri: string;
    name: string;
    type: string;
  } | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState(
    product.imageUrl || null
  );

  useEffect(() => {
    setFormData({
      name: product.name,
      sku: product.sku,
      quantity: product.quantity.toString(),
      price: product.price.toString(),
      barcodeUrl: product.barcodeUrl,
      categoryId: product.category.id,
    });
    setExistingImageUrl(product.imageUrl || null);
    setImageData(null);
  }, [product]);

  const handleSubmit = async () => {
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

      // Create FormData for multipart/form-data
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("sku", formData.sku);
      formDataToSend.append("quantity", formData.quantity);
      formDataToSend.append("price", formData.price);
      formDataToSend.append("barcodeUrl", formData.barcodeUrl);
      formDataToSend.append("categoryId", formData.categoryId);

      // If new image selected, append it
      if (imageData) {
        formDataToSend.append("image", {
          uri: imageData.uri,
          name: imageData.name,
          type: imageData.type,
        } as any);
      } else if (existingImageUrl) {
        // Keep existing image URL if no new image
        formDataToSend.append("imageUrl", existingImageUrl);
      }

      const response = await fetch(
        `${API_URL}/api/products/update/${product.id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            // Don't set Content-Type - let fetch set it automatically with boundary
          },
          body: formDataToSend,
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

  const handleImageChange = (
    newImageData: { uri: string; name: string; type: string } | null
  ) => {
    setImageData(newImageData);
    if (newImageData) {
      setExistingImageUrl(null); // Clear existing image if new one selected
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

            {/* <BarcodeGeneratorField
                          sku={formData.sku}
                          onBarcodeGenerated={() => setBarcodeGenerated(true)}
                        /> */}

            <ImageUploadField
              label="Product Image"
              value={imageData?.uri || existingImageUrl}
              onImageSelected={handleImageChange}
            />

            <View className="grid gap-2">
              <Label>Category *</Label>
              <Text className="mb-1 text-sm text-gray-500">
                {formData.categoryId
                  ? categories.find((c) => c.id === formData.categoryId)?.name
                  : "Select a category"}
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {categories.map((cat) => {
                  const isSelected = formData.categoryId === cat.id;
                  return (
                    <Pressable
                      key={cat.id}
                      onPress={() =>
                        setFormData({ ...formData, categoryId: cat.id })
                      }
                      className={`rounded-lg px-4 py-2.5 border-2 ${
                        isSelected
                          ? "bg-green-50 border-green-500"
                          : "bg-gray-50 border-gray-300"
                      }`}
                    >
                      <View className="flex-row items-center gap-2">
                        <View
                          className={`w-5 h-5 rounded border-2 items-center justify-center ${
                            isSelected
                              ? "bg-green-500 border-green-500"
                              : "bg-white border-gray-300"
                          }`}
                        >
                          {isSelected && (
                            <Text className="text-white text-xs font-bold">
                              ✓
                            </Text>
                          )}
                        </View>
                        <Text
                          className={`text-sm font-medium ${
                            isSelected ? "text-green-700" : "text-gray-700"
                          }`}
                        >
                          {cat.name}
                        </Text>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
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
