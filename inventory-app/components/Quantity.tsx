import React, { useState } from "react";
import { View, Text, TextInput, Alert } from "react-native";
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

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="flex-1 bg-green-500 text-primary">
          <Text className="text-xs font-semibold">Update Quantity</Text>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader className="mb-2">
          <DialogTitle className="text-xl">Update Quantity</DialogTitle>
          <DialogDescription className="text-base mt-2">
            Current stock:{" "}
            <Text className="font-bold text-primary">{currentQuantity}</Text>{" "}
            units
          </DialogDescription>
        </DialogHeader>

        <View className="flex flex-col gap-4 py-4">
          {/* Amount Input */}
          <View className="flex flex-col gap-2">
            <Text className="text-sm font-medium text-foreground">
              Enter Amount
            </Text>
            <TextInput
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
              placeholder="0"
              className="border-2 border-border bg-background text-foreground px-4 py-3 rounded-lg text-lg font-semibold text-center"
              placeholderTextColor="#888"
            />
          </View>

          {/* Action Buttons */}
          <View className="flex flex-row gap-3 mt-2">
            <Button
              onPress={() => updateQuantity("increase")}
              disabled={loading || !amount || parseInt(amount) <= 0}
              className="flex-1 bg-green-600 active:bg-green-700"
            >
              <Text className="text-primary font-bold ">
                {loading ? "..." : "+ Increase"}
              </Text>
            </Button>
            <Button
              onPress={() => updateQuantity("decrease")}
              disabled={loading || !amount || parseInt(amount) <= 0}
              variant="destructive"
              className="flex-1 "
            >
              <Text className="text-primary font-bold ">
                {loading ? "..." : "- Decrease"}
              </Text>
            </Button>
          </View>

          {/* Preview */}
          {amount && parseInt(amount) > 0 && (
            <View className="bg-muted rounded-lg p-3 mt-2 min-h-[60px]">
              <Text className="text-sm text-muted-foreground text-center">
                New quantity will be:{" "}
                <Text className="font-bold text-foreground">
                  {currentQuantity + parseInt(amount)}
                </Text>{" "}
                (increase) or{" "}
                <Text className="font-bold text-foreground">
                  {Math.max(0, currentQuantity - parseInt(amount))}
                </Text>{" "}
                (decrease)
              </Text>
            </View>
          )}
        </View>

        <DialogFooter className="mt-2">
          <DialogClose asChild>
            <Button variant="outline" onPress={handleClose} className="w-full">
              <Text className="font-semibold">Cancel</Text>
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
