import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Text } from "@/components/ui/text";
import { Alert } from "react-native";
import { Icon } from "../ui/icon";
import { Trash2 } from "lucide-react-native";
import { useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { API_URL } from "@/constants/api";

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

      const response = await fetch(
        `${API_URL}/api/products/delete/${productId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

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
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        {trigger || (
          <Button variant="destructive" size="sm">
            <Icon as={Trash2} size={16} color={"white"} />
            <Text>Delete</Text>
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the
            product
            <Text className="font-semibold"> "{productName}"</Text> from the
            database.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button variant="outline" disabled={loading}>
              <Text>Cancel</Text>
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              variant="destructive"
              onPress={handleDelete}
              disabled={loading}
            >
              <Text>{loading ? "Deleting..." : "Delete Product"}</Text>
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
