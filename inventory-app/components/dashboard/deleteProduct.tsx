import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Alert,
  TouchableOpacity,
  Pressable,
} from "react-native";
import { useAuthStore } from "@/store/useAuthStore";
import { API_URL } from "@/constants/api";
import Feather from "@expo/vector-icons/Feather";

interface DeleteProductProps {
  productId: string;
  productName: string;
  onProductDeleted?: () => void;
  trigger?: React.ReactNode;
}

export function DeleteProduct({
  productId,
  productName,
  onProductDeleted,
  trigger,
}: DeleteProductProps) {
  const user = useAuthStore((state) => state.user);

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      const token = user?.token;
      if (!token) {
        Alert.alert("Error", "You must be logged in to delete products");
        return;
      }

      const response = await fetch(`${API_URL}/api/products/delete`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: productId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete product");
      }

      Alert.alert("Success", "Product deleted successfully!");
      setOpen(false);
      onProductDeleted?.();
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to delete product");
    } finally {
      setLoading(false);
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
          <Feather name="trash-2" size={16} color="#dc2626" />
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
              <Text style={styles.modalTitle}>Are you absolutely sure?</Text>
              <Text style={styles.modalDescription}>
                This action cannot be undone. This will permanently delete the
                product <Text style={styles.productName}>"{productName}"</Text>{" "}
                from the database.
              </Text>
            </View>

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
                  styles.buttonDestructive,
                  loading && styles.buttonDisabled,
                ]}
                onPress={handleDelete}
                disabled={loading}
                activeOpacity={0.7}
              >
                <Text style={styles.buttonDestructiveText}>
                  {loading ? "Deleting..." : "Delete"}
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
    maxWidth: 400,
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
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 12,
  },
  modalDescription: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 20,
  },
  productName: {
    fontWeight: "600",
    color: "#1f2937",
  },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 24,
    paddingTop: 0,
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
  buttonDestructive: {
    backgroundColor: "#dc2626",
  },
  buttonDestructiveText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
