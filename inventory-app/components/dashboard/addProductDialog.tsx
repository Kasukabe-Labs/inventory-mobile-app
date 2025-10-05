import React, { useState } from "react";
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
import { BarcodeGeneratorField } from "../BarcodeGeneratorField";
import { ImageUploadField } from "../ImageUploader";
import { NativeCategoryDropdown } from "../NativeCategoryDropdown";
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

      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("sku", formData.sku);
      formDataToSend.append("quantity", formData.quantity || "0");
      formDataToSend.append("price", formData.price);
      formDataToSend.append("categoryId", formData.categoryId);

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
    <>
      <TouchableOpacity
        style={styles.triggerButton}
        onPress={() => setOpen(true)}
        activeOpacity={0.7}
      >
        <Feather name="plus" size={20} color="#1f2937" />
      </TouchableOpacity>

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
              <Text style={styles.modalTitle}>Add New Product</Text>
              <Text style={styles.modalDescription}>
                Fill in the product details below. Fields marked with * are
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
                    placeholder="Enter SKU (must be unique)"
                    placeholderTextColor="#6b7280"
                    value={formData.sku}
                    onChangeText={(text) => {
                      setFormData({ ...formData, sku: text });
                      setBarcodeGenerated(false);
                    }}
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
                  <Text style={styles.label}>Quantity</Text>
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

                <View style={styles.fieldContainer}>
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
                  {loading ? "Adding..." : "Add Product"}
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
  triggerButton: {
    height: 48,
    backgroundColor: "#ffffff",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
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
