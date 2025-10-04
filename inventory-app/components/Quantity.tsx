import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Alert,
  StyleSheet,
  useColorScheme,
} from "react-native";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { API_URL } from "@/constants/api";
import { useAuthStore } from "@/store/useAuthStore";
import { Edit3Icon } from "lucide-react-native";
import { Icon } from "./ui/icon";

interface QuantityDialogProps {
  productId: string;
  currentQuantity: number;
  onQuantityUpdated?: (newQuantity: number) => void;
}

export default function QuantityDialog({
  productId,
  currentQuantity,
  onQuantityUpdated,
}: QuantityDialogProps) {
  const user = useAuthStore((state) => state.user);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const [amount, setAmount] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const updateQuantity = async (action: "increase" | "decrease") => {
    const amt = parseInt(amount);
    if (isNaN(amt) || amt <= 0) {
      Alert.alert("Invalid Input", "Please enter a valid positive number");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${API_URL}/api/products/updateQty/${productId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user?.token}`,
          },
          body: JSON.stringify({ amount: amt, action }),
        }
      );

      const data = await response.json();

      if (data.success) {
        onQuantityUpdated?.(data.data.quantity);
        setAmount("");
        setIsOpen(false);
        Alert.alert(
          "Success",
          `Quantity ${action === "increase" ? "increased" : "decreased"} by ${amt}`
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
  };

  const styles = StyleSheet.create({
    content: {
      width: 400,
      maxWidth: 400,
    },
    header: {
      marginBottom: 8,
    },
    title: {
      fontSize: 20,
      fontWeight: "600",
      color: isDark ? "#ffffff" : "#000000",
    },
    description: {
      fontSize: 15,
      marginTop: 8,
      color: isDark ? "#a1a1aa" : "#71717a",
    },
    currentStock: {
      fontWeight: "700",
      color: "#3b82f6",
    },
    body: {
      paddingVertical: 16,
      gap: 16,
    },
    inputContainer: {
      gap: 8,
    },
    label: {
      fontSize: 14,
      fontWeight: "500",
      color: isDark ? "#ffffff" : "#000000",
    },
    input: {
      borderWidth: 2,
      borderColor: isDark ? "#3f3f46" : "#e4e4e7",
      backgroundColor: isDark ? "#18181b" : "#ffffff",
      color: isDark ? "#ffffff" : "#000000",
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
    increaseButtonDisabled: {
      opacity: 0.5,
    },
    decreaseButton: {
      flex: 1,
      backgroundColor: "#dc2626",
      paddingVertical: 14,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
    },
    decreaseButtonDisabled: {
      opacity: 0.5,
    },
    buttonText: {
      color: "#ffffff",
      fontSize: 15,
      fontWeight: "700",
    },
    preview: {
      backgroundColor: isDark ? "#27272a" : "#f4f4f5",
      borderRadius: 8,
      padding: 12,
      marginTop: 8,
      height: 60,
      justifyContent: "center",
    },
    previewText: {
      fontSize: 14,
      color: isDark ? "#a1a1aa" : "#71717a",
      textAlign: "left",
      lineHeight: 20,
      flexShrink: 1,
    },
    previewBold: {
      fontWeight: "700",
      color: isDark ? "#ffffff" : "#000000",
    },
    footer: {
      marginTop: 8,
    },
    cancelButton: {
      width: "100%",
      paddingVertical: 12,
      borderRadius: 8,
      borderWidth: 2,
      borderColor: isDark ? "#3f3f46" : "#e4e4e7",
      backgroundColor: "transparent",
      alignItems: "center",
      justifyContent: "center",
    },
    cancelButtonText: {
      fontSize: 15,
      fontWeight: "600",
      color: isDark ? "#ffffff" : "#000000",
    },
    triggerButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 8,
      backgroundColor: "#3b82f6",
      borderRadius: 6,
    },
    triggerButtonText: {
      color: "#ffffff",
      fontSize: 14,
      fontWeight: "600",
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" style={styles.triggerButton}>
          <Icon as={Edit3Icon} size={16} color={"white"} />
          <Text style={styles.triggerButtonText}>Update Quantity</Text>
        </Button>
      </DialogTrigger>
      <DialogContent style={styles.content}>
        <DialogHeader style={styles.header} className="p-4">
          <DialogTitle style={styles.title}>Update Quantity</DialogTitle>
          <DialogDescription style={styles.description}>
            Current stock:{" "}
            <Text style={styles.currentStock}>{currentQuantity}</Text> units
          </DialogDescription>
        </DialogHeader>

        <View style={styles.body} className="p-4">
          {/* Amount Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Enter Amount</Text>
            <TextInput
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
              placeholder="0"
              style={styles.input}
              placeholderTextColor={isDark ? "#71717a" : "#a1a1aa"}
            />
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonRow}>
            <Button
              onPress={() => updateQuantity("increase")}
              disabled={loading || !amount || parseInt(amount) <= 0}
              style={[
                styles.increaseButton,
                (loading || !amount || parseInt(amount) <= 0) &&
                  styles.increaseButtonDisabled,
              ]}
            >
              <Text style={styles.buttonText}>
                {loading ? "..." : "+ Increase"}
              </Text>
            </Button>
            <Button
              onPress={() => updateQuantity("decrease")}
              disabled={loading || !amount || parseInt(amount) <= 0}
              style={[
                styles.decreaseButton,
                (loading || !amount || parseInt(amount) <= 0) &&
                  styles.decreaseButtonDisabled,
              ]}
            >
              <Text style={styles.buttonText}>
                {loading ? "..." : "- Decrease"}
              </Text>
            </Button>
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

        <DialogFooter style={styles.footer}>
          <DialogClose asChild>
            <Button
              variant="outline"
              onPress={handleClose}
              style={styles.cancelButton}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
