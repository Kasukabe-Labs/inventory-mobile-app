import { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  Dimensions,
  Vibration,
} from "react-native";
import { CameraView, Camera, BarcodeScanningResult } from "expo-camera";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import {
  X,
  Scan,
  CheckCircle2,
  AlertCircle,
  Flashlight,
  FlashlightOff,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { BlurView } from "expo-blur";

const { width, height } = Dimensions.get("window");
const SCAN_AREA_SIZE = width * 0.7;

const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://192.168.29.192:3000";

interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  category: {
    name: string;
  };
}

interface BarcodeScannerProps {
  onClose?: () => void;
  onProductFound?: (product: Product) => void;
}

export default function Scanner({
  onClose,
  onProductFound,
}: BarcodeScannerProps) {
  const router = useRouter();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    requestCameraPermission();
  }, []);

  const requestCameraPermission = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setHasPermission(status === "granted");
  };

  const handleBarCodeScanned = async ({ data }: BarcodeScanningResult) => {
    if (scanned || loading) return;

    setScanned(true);
    setLoading(true);
    setError(null);
    Vibration.vibrate(100);

    try {
      // Fetch all products and find by SKU
      const response = await fetch(`${API_URL}/api/products/get-all`);
      const result = await response.json();

      if (result.success) {
        const foundProduct = result.data.find((p: Product) => p.sku === data);

        if (foundProduct) {
          setProduct(foundProduct);
          Vibration.vibrate([0, 100, 100, 100]);

          // Call callback if provided
          onProductFound?.(foundProduct);

          // Navigate to product page after a short delay
          setTimeout(() => {
            router.push(`/products/${foundProduct.id}`);
          }, 1500);
        } else {
          setError("Product not found with this barcode");
          Vibration.vibrate([0, 100, 50, 100]);
          setTimeout(() => {
            setScanned(false);
            setError(null);
          }, 2000);
        }
      }
    } catch (err) {
      console.error("Error scanning barcode:", err);
      setError("Failed to scan barcode. Please try again.");
      Vibration.vibrate([0, 100, 50, 100]);
      setTimeout(() => {
        setScanned(false);
        setError(null);
      }, 2000);
    } finally {
      setLoading(false);
    }
  };

  const toggleFlash = () => {
    setFlashEnabled(!flashEnabled);
  };

  const resetScanner = () => {
    setScanned(false);
    setProduct(null);
    setError(null);
  };

  if (hasPermission === null) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <Text className="text-muted-foreground">
          Requesting camera permission...
        </Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View className="flex-1 bg-background items-center justify-center p-6">
        <Icon as={AlertCircle} size={64} className="text-destructive mb-4" />
        <Text className="text-foreground text-xl font-bold mb-2 text-center">
          Camera Permission Required
        </Text>
        <Text className="text-muted-foreground text-center mb-6">
          Please grant camera permission to scan barcodes
        </Text>
        <Button onPress={requestCameraPermission}>
          <Text>Grant Permission</Text>
        </Button>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: [
            "qr",
            "ean13",
            "ean8",
            "code128",
            "code39",
            "code93",
            "codabar",
            "upc_a",
            "upc_e",
          ],
        }}
        enableTorch={flashEnabled}
      >
        {/* Header with Close Button */}
        <BlurView intensity={80} tint="dark" style={styles.header}>
          <View className="flex-row items-center justify-between px-4 pt-12 pb-4">
            <Pressable onPress={onClose} className="active:opacity-70">
              <Icon as={X} size={28} color="white" />
            </Pressable>

            <Text className="text-white text-lg font-semibold">
              Scan Barcode
            </Text>

            <Pressable onPress={toggleFlash} className="active:opacity-70">
              <Icon
                as={flashEnabled ? Flashlight : FlashlightOff}
                size={24}
                color="white"
              />
            </Pressable>
          </View>
        </BlurView>

        {/* Scanning Area Overlay */}
        <View style={styles.overlay}>
          {/* Top Overlay */}
          <View style={styles.topOverlay} />

          {/* Middle Row with Scan Area */}
          <View style={styles.middleRow}>
            <View style={styles.sideOverlay} />

            {/* Scan Area */}
            <View style={styles.scanArea}>
              {/* Corner Borders */}
              <View style={styles.cornerTopLeft} />
              <View style={styles.cornerTopRight} />
              <View style={styles.cornerBottomLeft} />
              <View style={styles.cornerBottomRight} />

              {/* Scanning Line Animation - only show when actively scanning */}
              {!scanned && !loading && !product && (
                <View style={styles.scanLineContainer}>
                  <View style={styles.scanLine} />
                </View>
              )}

              {product && (
                <View style={styles.resultContainer}>
                  <Icon as={CheckCircle2} size={64} color="#22c55e" />
                  <Text className="text-white text-xl font-bold mt-4 text-center">
                    Product Found!
                  </Text>
                  <Text className="text-white/80 text-sm mt-2 text-center px-4">
                    {product.name}
                  </Text>
                </View>
              )}

              {/* Error State */}
              {error && (
                <View style={styles.resultContainer}>
                  <Icon as={AlertCircle} size={64} color="#ef4444" />
                  <Text className="text-white text-xl font-bold mt-4 text-center">
                    {error}
                  </Text>
                </View>
              )}

              {/* Loading State */}
              {loading && !product && (
                <View style={styles.resultContainer}>
                  <View className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                  <Text className="text-white text-lg font-semibold mt-4">
                    Searching...
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.sideOverlay} />
          </View>

          {/* Bottom Overlay */}
          <View style={styles.bottomOverlay} />
        </View>

        {/* Instructions at Bottom */}
        {!scanned && !loading && (
          <BlurView intensity={80} tint="dark" style={styles.instructions}>
            <Icon as={Scan} size={32} color="white" className="mb-3" />
            <Text className="text-white text-lg font-semibold mb-2">
              Position barcode in the frame
            </Text>
            <Text className="text-white/70 text-sm text-center">
              The barcode will be scanned automatically
            </Text>
          </BlurView>
        )}

        {/* Retry Button */}
        {scanned && !product && !loading && (
          <View style={styles.retryButton}>
            <Button onPress={resetScanner} variant="default" size="lg">
              <Text className="text-lg">Scan Again</Text>
            </Button>
          </View>
        )}
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  overlay: {
    flex: 1,
  },
  topOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  middleRow: {
    flexDirection: "row",
    height: SCAN_AREA_SIZE,
  },
  sideOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  scanArea: {
    width: SCAN_AREA_SIZE,
    height: SCAN_AREA_SIZE,
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  cornerTopLeft: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 40,
    height: 40,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderColor: "white",
    borderTopLeftRadius: 8,
  },
  cornerTopRight: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 40,
    height: 40,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderColor: "white",
    borderTopRightRadius: 8,
  },
  cornerBottomLeft: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: 40,
    height: 40,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderColor: "white",
    borderBottomLeftRadius: 8,
  },
  cornerBottomRight: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderColor: "white",
    borderBottomRightRadius: 8,
  },
  scanLineContainer: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
  },
  scanLine: {
    width: "100%",
    height: 2,
    backgroundColor: "#22c55e",
    shadowColor: "#22c55e",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
  },
  bottomOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  instructions: {
    position: "absolute",
    bottom: 60,
    left: 20,
    right: 20,
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
  },
  resultContainer: {
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  retryButton: {
    position: "absolute",
    bottom: 60,
    left: 20,
    right: 20,
    alignItems: "center",
  },
});
