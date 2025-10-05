import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Alert,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Pressable,
} from "react-native";
import { API_URL } from "@/constants/api";
import { useAuthStore } from "@/store/useAuthStore";
import Feather from "@expo/vector-icons/Feather";

interface QuantityDialogProps {
  id: string;
  currentQuantity: number;
  onQuantityUpdated?: (newQuantity: number) => void;
}

export default function QuantityDialog({
  id,
  currentQuantity,
  onQuantityUpdated,
}: QuantityDialogProps) {
  const user = useAuthStore((state) => state.user);

  const [amount, setAmount] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<
    "increase" | "decrease" | null
  >(null);

  const updateQuantity = async () => {
    if (!pendingAction) return;

    const amt = parseInt(amount);
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/products/updateQty`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify({ id, amount: amt, action: pendingAction }),
      });

      const data = await response.json();

      if (data.success) {
        onQuantityUpdated?.(data.data.quantity);
        setAmount("");
        setIsOpen(false);
        setConfirmOpen(false);
        setPendingAction(null);
        Alert.alert(
          "Success",
          `Quantity ${pendingAction === "increase" ? "increased" : "decreased"} by ${amt}`
        );
      } else {
        Alert.alert("Error", data.message || "Failed to update quantity");
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to update quantity. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setAmount("");
    setIsOpen(false);
    setPendingAction(null);
  };

  const handleActionClick = (action: "increase" | "decrease") => {
    const amt = parseInt(amount);
    if (isNaN(amt) || amt <= 0) {
      Alert.alert("Invalid Input", "Please enter a valid positive number");
      return;
    }
    setPendingAction(action);
    setConfirmOpen(true);
  };

  const getNewQuantity = () => {
    const amt = parseInt(amount);
    if (!pendingAction) return currentQuantity;
    return pendingAction === "increase"
      ? currentQuantity + amt
      : Math.max(0, currentQuantity - amt);
  };

  return (
    <>
      {/* Trigger Button */}
      <TouchableOpacity
        style={styles.triggerButton}
        onPress={() => setIsOpen(true)}
        activeOpacity={0.7}
      >
        <Feather name="package" size={16} color="#2563eb" />
      </TouchableOpacity>

      {/* Main Dialog */}
      <Modal
        visible={isOpen}
        animationType="fade"
        transparent={true}
        onRequestClose={handleClose}
      >
        <Pressable style={styles.modalOverlay} onPress={handleClose}>
          <Pressable
            style={styles.modalContent}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Update Quantity</Text>
              <Text style={styles.modalDescription}>
                Current stock:{" "}
                <Text style={styles.currentStock}>{currentQuantity}</Text> units
              </Text>
            </View>

            <View style={styles.modalBody}>
              {/* Amount Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Enter Amount</Text>
                <TextInput
                  keyboardType="numeric"
                  value={amount}
                  onChangeText={setAmount}
                  placeholder="0"
                  style={styles.input}
                  placeholderTextColor="#6b7280"
                />
              </View>

              {/* Action Buttons */}
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  onPress={() => handleActionClick("increase")}
                  disabled={loading || !amount || parseInt(amount) <= 0}
                  style={[
                    styles.increaseButton,
                    (loading || !amount || parseInt(amount) <= 0) &&
                      styles.buttonDisabled,
                  ]}
                  activeOpacity={0.7}
                >
                  <Text style={styles.buttonText}>+ Increase</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleActionClick("decrease")}
                  disabled={loading || !amount || parseInt(amount) <= 0}
                  style={[
                    styles.decreaseButton,
                    (loading || !amount || parseInt(amount) <= 0) &&
                      styles.buttonDisabled,
                  ]}
                  activeOpacity={0.7}
                >
                  <Text style={styles.buttonText}>- Decrease</Text>
                </TouchableOpacity>
              </View>

              {/* Preview */}
              {amount && parseInt(amount) > 0 && (
                <View style={styles.preview}>
                  <Text style={styles.previewText}>
                    New quantity will be:{" "}
                    <Text style={styles.previewBold}>
                      {currentQuantity + parseInt(amount)}
                    </Text>{" "}
                    (increase) or{" "}
                    <Text style={styles.previewBold}>
                      {Math.max(0, currentQuantity - parseInt(amount))}
                    </Text>{" "}
                    (decrease)
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleClose}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Confirmation Dialog */}
      <Modal
        visible={confirmOpen}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setConfirmOpen(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setConfirmOpen(false)}
        >
          <Pressable
            style={styles.confirmModalContent}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Are you absolutely sure?</Text>
              <Text style={styles.modalDescription}>
                You are about to{" "}
                <Text style={styles.previewBold}>
                  {pendingAction === "increase" ? "increase" : "decrease"}
                </Text>{" "}
                the quantity by <Text style={styles.previewBold}>{amount}</Text>{" "}
                units.{"\n\n"}
                The new quantity will be:{" "}
                <Text style={styles.previewBold}>{getNewQuantity()}</Text>{" "}
                units.
              </Text>
            </View>

            <View style={styles.confirmFooter}>
              <TouchableOpacity
                style={[styles.button, styles.buttonOutline]}
                onPress={() => setConfirmOpen(false)}
                disabled={loading}
                activeOpacity={0.7}
              >
                <Text style={styles.buttonOutlineText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.button,
                  pendingAction === "increase"
                    ? styles.buttonPrimary
                    : styles.buttonDestructive,
                  loading && styles.buttonDisabled,
                ]}
                onPress={updateQuantity}
                disabled={loading}
                activeOpacity={0.7}
              >
                <Text style={styles.buttonPrimaryText}>
                  {loading ? "Updating..." : "Confirm"}
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
  confirmModalContent: {
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
  currentStock: {
    fontWeight: "700",
    color: "#2563eb",
  },
  modalBody: {
    padding: 24,
    gap: 16,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
  },
  input: {
    borderWidth: 2,
    borderColor: "#e5e7eb",
    backgroundColor: "#ffffff",
    color: "#1f2937",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  increaseButton: {
    flex: 1,
    backgroundColor: "#16a34a",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  decreaseButton: {
    flex: 1,
    backgroundColor: "#dc2626",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
  },
  preview: {
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  previewText: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 20,
  },
  previewBold: {
    fontWeight: "700",
    color: "#1f2937",
  },
  modalFooter: {
    padding: 24,
    paddingTop: 0,
  },
  cancelButton: {
    width: "100%",
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1f2937",
  },
  confirmFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 24,
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
  buttonDestructive: {
    backgroundColor: "#dc2626",
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
