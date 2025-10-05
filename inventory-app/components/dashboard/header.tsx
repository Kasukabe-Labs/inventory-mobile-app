import {
  Alert,
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Modal,
  Pressable,
} from "react-native";
import React, { useState } from "react";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useAuthStore } from "@/store/useAuthStore";
import { router } from "expo-router";

export default function Header() {
  const user = useAuthStore((state) => state.user);
  const clearUser = useAuthStore((state) => state.clearUser);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loading, setLoading] = useState(false);

  function logoutUser() {
    setLoading(true);
    try {
      clearUser();
      setShowLogoutModal(false);
      Alert.alert("User Logged Out", "Please login again to gain access");
      router.push("/");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <View style={styles.container}>
        {/* Left Section: Avatar + User Info */}
        <View style={styles.leftSection}>
          <View style={styles.avatar}>
            <Image
              source={{ uri: "https://github.com/shadcn.png" }}
              style={styles.avatarImage}
            />
          </View>

          <View style={styles.userInfo}>
            <View style={styles.welcomeRow}>
              <Text style={styles.welcomeText}>Welcome</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{user?.role}</Text>
              </View>
            </View>
            <Text style={styles.emailText}>{user?.email}</Text>
          </View>
        </View>

        {/* Right Section: Action Buttons */}
        <View style={styles.rightSection}>
          {user?.role === "ADMIN" && (
            <TouchableOpacity
              style={styles.settingsButton}
              onPress={() => router.push("/settings")}
            >
              <MaterialIcons name="settings" size={20} color="#ffffff" />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.logoutButton}
            onPress={() => setShowLogoutModal(true)}
          >
            <MaterialIcons name="logout" size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Logout Confirmation Modal */}
      <Modal
        visible={showLogoutModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowLogoutModal(false)}
        >
          <Pressable
            style={styles.modalContent}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Confirm Logout</Text>
              <Text style={styles.modalDescription}>
                Are you sure you want to logout? You will need to login again to
                access your account.
              </Text>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.button, styles.buttonOutline]}
                onPress={() => setShowLogoutModal(false)}
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
                onPress={logoutUser}
                disabled={loading}
                activeOpacity={0.7}
              >
                <Text style={styles.buttonDestructiveText}>
                  {loading ? "Logging out..." : "Logout"}
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
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 16,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#f3f4f6",
    borderWidth: 2,
    borderColor: "#e5e7eb",
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  userInfo: {
    flex: 1,
    justifyContent: "center",
  },
  welcomeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 2,
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1f2937",
  },
  badge: {
    backgroundColor: "#dbeafe",
    color: "#fefefe",
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginTop: 2,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#2563eb",
    textTransform: "uppercase",
  },
  emailText: {
    fontSize: 13,
    color: "#6b7280",
  },
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  settingsButton: {
    backgroundColor: "#2563eb",
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#2563eb",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutButton: {
    backgroundColor: "#dc2626",
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#dc2626",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
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
