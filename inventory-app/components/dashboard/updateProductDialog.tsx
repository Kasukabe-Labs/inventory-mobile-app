import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  Alert,
  TouchableOpacity,
  TextInput,
  Pressable,
} from "react-native";
import { useAuthStore } from "@/store/useAuthStore";
import { API_URL } from "@/constants/api";
import { useCategoryStore } from "@/store/useCategoryStore";
import { ImageUploadField } from "../ImageUploader";
import { NativeCategoryDropdown } from "../NativeCategoryDropdown";
import { Product } from "../ProductList";
import Feather from "@expo/vector-icons/Feather";

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
    categoryId: product.category.id, // ✅ renamed
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

      const formDataToSend = new FormData();
      formDataToSend.append("id", product.id);
      formDataToSend.append("name", formData.name);
      formDataToSend.append("sku", formData.sku);
      formDataToSend.append("quantity", formData.quantity);
      formDataToSend.append("price", formData.price);
      formDataToSend.append("barcodeUrl", formData.barcodeUrl);
      formDataToSend.append("categoryId", formData.categoryId);

      if (imageData) {
        formDataToSend.append("image", {
          uri: imageData.uri,
          name: imageData.name,
          type: imageData.type,
        } as any);
      } else if (existingImageUrl) {
        formDataToSend.append("imageUrl", existingImageUrl);
      }

      const response = await fetch(`${API_URL}/api/products/update`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });

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
      setExistingImageUrl(null);
    }
  };

  return (
    <>
      {trigger ? (
        <Pressable onPress={() => setOpen(true)}>{trigger}</Pressable>
      ) : (
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => setOpen(true)}
          activeOpacity={0.7}
        >
          <Feather name="edit" size={16} color="#2563eb" />
        </TouchableOpacity>
      )}

      <Modal
        visible={open}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setOpen(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setOpen(false)}>
          <Pressable
            style={styles.modalContent}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Update Product</Text>
              <Text style={styles.modalDescription}>
                Make changes to the product details. Fields marked with * are
                required.
              </Text>
            </View>

            <ScrollView
              style={styles.scrollView}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.formContainer}>
                <View style={styles.fieldContainer}>
                  <Text style={styles.label}>Product Name *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter product name"
                    placeholderTextColor="#6b7280"
                    value={formData.name}
                    onChangeText={(text) =>
                      setFormData({ ...formData, name: text })
                    }
                  />
                </View>

                <View style={styles.fieldContainer}>
                  <Text style={styles.label}>SKU *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter SKU"
                    placeholderTextColor="#6b7280"
                    value={formData.sku}
                    onChangeText={(text) =>
                      setFormData({ ...formData, sku: text })
                    }
                  />
                </View>

                <View style={styles.fieldContainer}>
                  <Text style={styles.label}>Price *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0.00"
                    placeholderTextColor="#6b7280"
                    keyboardType="decimal-pad"
                    value={formData.price}
                    onChangeText={(text) =>
                      setFormData({ ...formData, price: text })
                    }
                  />
                </View>

                <View style={styles.fieldContainer}>
                  <Text style={styles.label}>Quantity *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0"
                    placeholderTextColor="#6b7280"
                    keyboardType="number-pad"
                    value={formData.quantity}
                    onChangeText={(text) =>
                      setFormData({ ...formData, quantity: text })
                    }
                  />
                </View>

                <ImageUploadField
                  label="Product Image"
                  value={imageData?.uri || existingImageUrl}
                  onImageSelected={handleImageChange}
                />

                <View style={styles.fieldContainer}>
                  <NativeCategoryDropdown
                    label="Category *"
                    value={formData.categoryId}
                    onValueChange={(categoryId) => {
                      setFormData({ ...formData, categoryId });
                    }}
                    categories={categories}
                    placeholder="Select a category"
                  />
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.button, styles.buttonOutline]}
                onPress={() => setOpen(false)}
                disabled={loading}
                activeOpacity={0.7}
              >
                <Text style={styles.buttonOutlineText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.button,
                  styles.buttonPrimary,
                  loading && styles.buttonDisabled,
                ]}
                onPress={handleSubmit}
                disabled={loading}
                activeOpacity={0.7}
              >
                <Text style={styles.buttonPrimaryText}>
                  {loading ? "Updating..." : "Save"}
                </Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  actionButton: {
    flex: 1,
    backgroundColor: "#f9fafb",
    padding: 8,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    width: "90%",
    maxWidth: 500,
    maxHeight: "80%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 8,
  },
  modalDescription: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 20,
  },
  scrollView: {
    maxHeight: 400,
  },
  formContainer: {
    padding: 14,
    gap: 16,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    color: "#1f2937",
    backgroundColor: "#ffffff",
  },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 14,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    gap: 12,
  },
  button: {
    flex: 1,
    height: 44,
    paddingHorizontal: 20,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonOutline: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  buttonOutlineText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
  },
  buttonPrimary: {
    backgroundColor: "#2563eb",
  },
  buttonPrimaryText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
