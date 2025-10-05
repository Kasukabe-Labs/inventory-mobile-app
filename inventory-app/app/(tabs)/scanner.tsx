import { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  Dimensions,
  Vibration,
  Text,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { CameraView, Camera, BarcodeScanningResult } from "expo-camera";
import { useRouter } from "expo-router";
import { BlurView } from "expo-blur";
import { useFocusEffect } from "@react-navigation/native";
import Feather from "@expo/vector-icons/Feather";

const { width } = Dimensions.get("window");
const SCAN_AREA_SIZE = width * 0.7;

const API_URL = process.env.EXPO_PUBLIC_API_URL;

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

  useFocusEffect(
    useCallback(() => {
      setScanned(false);
      setLoading(false);
      setProduct(null);
      setError(null);

      return () => {
        setScanned(false);
        setLoading(false);
        setProduct(null);
        setError(null);
      };
    }, [])
  );

  const requestCameraPermission = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setHasPermission(status === "granted");
  };

  const handleBarCodeScanned = async ({
    data,
    type,
  }: BarcodeScanningResult) => {
    if (scanned || loading) return;

    setScanned(true);
    setLoading(true);
    setError(null);
    Vibration.vibrate(100);

    try {
      let scannedCode = data.trim();
      console.log("Raw scanned barcode:", scannedCode, "Type:", type);

      scannedCode = scannedCode
        .replace(/\s+/g, "")
        .replace(/[^\x20-\x7E]/g, "");

      console.log("Cleaned barcode:", scannedCode);

      const parts = scannedCode.split("|");

      if (parts.length < 3) {
        console.log("Invalid format, trying direct SKU match");
        await tryDirectSKUMatch(scannedCode);
        return;
      }

      let [sku, priceStr, quantityStr] = parts;

      sku = sku.trim();
      priceStr = priceStr.trim();
      quantityStr = quantityStr.trim();

      const price = parseFloat(priceStr);
      const quantity = parseInt(quantityStr, 10);

      console.log("Parsed - SKU:", sku, "Price:", price, "Quantity:", quantity);

      const response = await fetch(`${API_URL}/api/products/get-all`);
      const result = await response.json();

      if (result.success) {
        let foundProduct = result.data.find(
          (p: Product) =>
            p.sku && p.sku.trim().toUpperCase() === sku.toUpperCase()
        );

        if (!foundProduct) {
          foundProduct = result.data.find((p: Product) => {
            if (!p.sku) return false;
            const productSku = p.sku.trim().toUpperCase();
            const scannedSku = sku.toUpperCase();

            return (
              productSku.includes(scannedSku) || scannedSku.includes(productSku)
            );
          });
        }

        if (foundProduct) {
          console.log("Product found:", foundProduct);
          setProduct(foundProduct);
          Vibration.vibrate([0, 100, 100, 100]);

          onProductFound?.(foundProduct);

          setTimeout(() => {
            router.push(`/products/${foundProduct.id}`);
            setTimeout(() => {
              setProduct(null);
              setScanned(false);
              setLoading(false);
            }, 500);
          }, 1500);
        } else {
          console.log("Product not found. SKU:", sku);
          console.log(
            "Available SKUs:",
            result.data.map((p: Product) => p.sku)
          );
          setError("Product not found");
          Vibration.vibrate([0, 100, 50, 100]);
          setTimeout(() => {
            setScanned(false);
            setError(null);
            setLoading(false);
          }, 2000);
        }
      }
    } catch (err) {
      console.error("Error scanning barcode:", err);
      setError("Scan error. Try again");
      Vibration.vibrate([0, 100, 50, 100]);
      setTimeout(() => {
        setScanned(false);
        setError(null);
        setLoading(false);
      }, 2000);
    }
  };

  const tryDirectSKUMatch = async (scannedCode: string) => {
    try {
      const response = await fetch(`${API_URL}/api/products/get-all`);
      const result = await response.json();

      if (result.success) {
        const foundProduct = result.data.find(
          (p: Product) =>
            p.sku &&
            (p.sku.trim().toUpperCase() === scannedCode.toUpperCase() ||
              scannedCode.toUpperCase().includes(p.sku.trim().toUpperCase()))
        );

        if (foundProduct) {
          console.log("Product found via direct match:", foundProduct);
          setProduct(foundProduct);
          Vibration.vibrate([0, 100, 100, 100]);
          onProductFound?.(foundProduct);

          setTimeout(() => {
            router.push(`/products/${foundProduct.id}`);
            setTimeout(() => {
              setProduct(null);
              setScanned(false);
              setLoading(false);
            }, 500);
          }, 1500);
        } else {
          throw new Error("Product not found");
        }
      }
    } catch (err) {
      setError("Product not found");
      Vibration.vibrate([0, 100, 50, 100]);
      setTimeout(() => {
        setScanned(false);
        setError(null);
        setLoading(false);
      }, 2000);
    }
  };

  const toggleFlash = () => {
    setFlashEnabled(!flashEnabled);
  };

  const resetScanner = () => {
    setScanned(false);
    setProduct(null);
    setError(null);
    setLoading(false);
  };

  if (hasPermission === null) {
    return (
      <View style={styles.permissionContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.permissionText}>
          Requesting camera permission...
        </Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.permissionContainer}>
        <Feather name="alert-circle" size={64} color="#dc2626" />
        <Text style={styles.permissionTitle}>Camera Permission Required</Text>
        <Text style={styles.permissionSubtitle}>
          Please grant camera permission to scan barcodes
        </Text>
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={requestCameraPermission}
          activeOpacity={0.7}
        >
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ["code128"],
        }}
        enableTorch={flashEnabled}
      />

      {/* Header with Close Button */}
      <BlurView intensity={80} tint="dark" style={styles.header}>
        <View style={styles.headerContent}>
          <Pressable onPress={onClose} style={styles.headerButton}>
            <Feather name="x" size={28} color="#ffffff" />
          </Pressable>

          <Text style={styles.headerTitle}>Scan Barcode</Text>

          <Pressable onPress={toggleFlash} style={styles.headerButton}>
            <Feather
              name={flashEnabled ? "zap" : "zap-off"}
              size={24}
              color="#ffffff"
            />
          </Pressable>
        </View>
      </BlurView>

      {/* Scanning Area Overlay */}
      <View style={styles.overlay}>
        <View style={styles.topOverlay} />

        <View style={styles.middleRow}>
          <View style={styles.sideOverlay} />

          <View style={styles.scanArea}>
            <View style={styles.cornerTopLeft} />
            <View style={styles.cornerTopRight} />
            <View style={styles.cornerBottomLeft} />
            <View style={styles.cornerBottomRight} />

            {!scanned && !loading && !product && (
              <View style={styles.scanLineContainer}>
                <View style={styles.scanLine} />
              </View>
            )}

            {product && (
              <View style={styles.resultContainer}>
                <Feather name="check-circle" size={64} color="#10b981" />
                <Text style={styles.resultTitle}>Product Found!</Text>
                <Text style={styles.resultSubtitle}>{product.name}</Text>
                <Text style={styles.resultNote}>Opening product...</Text>
              </View>
            )}

            {error && (
              <View style={styles.resultContainer}>
                <Feather name="alert-circle" size={64} color="#dc2626" />
                <Text style={styles.resultTitle}>{error}</Text>
              </View>
            )}

            {loading && !product && !error && (
              <View style={styles.resultContainer}>
                <ActivityIndicator size="large" color="#ffffff" />
                <Text style={styles.loadingText}>Searching...</Text>
              </View>
            )}
          </View>

          <View style={styles.sideOverlay} />
        </View>

        <View style={styles.bottomOverlay} />
      </View>

      {/* Instructions at Bottom */}
      {!scanned && !loading && !product && !error && (
        <BlurView intensity={80} tint="dark" style={styles.instructions}>
          <Feather name="maximize" size={32} color="#ffffff" />
          <Text style={styles.instructionsTitle}>
            Position barcode in the frame
          </Text>
          <Text style={styles.instructionsSubtitle}>
            Hold steady for best results
          </Text>
        </BlurView>
      )}

      {/* Retry Button */}
      {scanned && !product && !loading && error && (
        <View style={styles.retryButtonContainer}>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={resetScanner}
            activeOpacity={0.7}
          >
            <Text style={styles.retryButtonText}>Scan Again</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#ffffff",
  },
  permissionText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6b7280",
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1f2937",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  permissionSubtitle: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 24,
  },
  permissionButton: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 16,
  },
  headerButton: {
    padding: 4,
  },
  headerTitle: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "600",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
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
    borderColor: "#ffffff",
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
    borderColor: "#ffffff",
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
    borderColor: "#ffffff",
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
    borderColor: "#ffffff",
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
    backgroundColor: "#10b981",
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
  },
  bottomOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  resultContainer: {
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  resultTitle: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "700",
    marginTop: 16,
    textAlign: "center",
  },
  resultSubtitle: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
    paddingHorizontal: 16,
  },
  resultNote: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 12,
    marginTop: 8,
  },
  loadingText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
  },
  instructions: {
    position: "absolute",
    bottom: 60,
    left: 20,
    right: 20,
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    zIndex: 5,
  },
  instructionsTitle: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "600",
    marginTop: 12,
    marginBottom: 8,
  },
  instructionsSubtitle: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 14,
    textAlign: "center",
  },
  retryButtonContainer: {
    position: "absolute",
    bottom: 60,
    left: 20,
    right: 20,
    alignItems: "center",
    zIndex: 5,
  },
  retryButton: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
  },
  retryButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "600",
  },
});
