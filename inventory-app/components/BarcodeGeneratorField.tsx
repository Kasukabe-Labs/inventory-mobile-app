import { useState } from "react";
import { View, Image, ActivityIndicator, Alert } from "react-native";
import { Text } from "@/components/ui/text";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Barcode, RefreshCw } from "lucide-react-native";
import { useAuthStore } from "@/store/useAuthStore";
import { API_URL } from "@/constants/api";

interface BarcodeGeneratorFieldProps {
  sku: string;
  price: number;
  quantity: number;
  onBarcodeGenerated?: () => void;
}

export function BarcodeGeneratorField({
  sku,
  price,
  quantity,
  onBarcodeGenerated,
}: BarcodeGeneratorFieldProps) {
  const user = useAuthStore((state) => state.user);
  const [barcodePreview, setBarcodePreview] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  const generateBarcode = async () => {
    if (!sku || sku.trim() === "") {
      Alert.alert("Error", "Please enter a SKU first");
      return;
    }

    if (price === undefined || quantity === undefined) {
      Alert.alert("Error", "Price and quantity are required");
      return;
    }

    setGenerating(true);
    try {
      const token = user?.token;
      if (!token) {
        Alert.alert("Error", "You must be logged in");
        return;
      }

      const response = await fetch(
        `${API_URL}/api/products/generate-barcode-preview`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ sku, price, quantity }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to generate barcode");
      }

      setBarcodePreview(data.data.barcodePreview);
      onBarcodeGenerated?.();
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to generate barcode");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <View className="grid gap-2">
      <Label>Barcode *</Label>

      <View className="flex-row gap-2">
        <Button
          onPress={generateBarcode}
          disabled={generating || !sku}
          variant="outline"
          className="flex-1"
        >
          {generating ? (
            <ActivityIndicator size="small" color="#4B5563" />
          ) : (
            <>
              <Icon as={Barcode} size={18} />
              <Text>Generate Barcode</Text>
            </>
          )}
        </Button>

        {barcodePreview && (
          <Button
            onPress={generateBarcode}
            disabled={generating}
            variant="outline"
            size="icon"
          >
            <Icon as={RefreshCw} size={18} />
          </Button>
        )}
      </View>

      {barcodePreview ? (
        <View className="mt-2 border-2 border-gray-300 rounded-lg p-4 bg-white items-center">
          <Image
            source={{ uri: barcodePreview }}
            className="w-full h-24"
            resizeMode="contain"
          />
          <Text className="text-xs text-gray-500 mt-2">
            Preview - Will be saved automatically
          </Text>
        </View>
      ) : (
        <View className="border-2 border-dashed border-gray-300 rounded-lg p-6 items-center justify-center bg-gray-50">
          <Icon as={Barcode} size={32} className="text-gray-400 mb-2" />
          <Text className="text-sm text-gray-600 text-center">
            Click "Generate Barcode" to preview
          </Text>
          <Text className="text-xs text-gray-400 text-center mt-1">
            Barcode will be generated from SKU, price, and quantity
          </Text>
        </View>
      )}

      {!sku && (
        <Text className="text-xs text-amber-600 mt-1">
          ⚠️ Please enter a SKU to generate barcode
        </Text>
      )}
    </View>
  );
}
