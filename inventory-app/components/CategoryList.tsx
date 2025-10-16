import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal,
  ScrollView,
  Animated,
} from "react-native";
import { useState, useRef, useEffect } from "react";
import Feather from "@expo/vector-icons/Feather";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

interface Category {
  id: string;
  name: string;
  _count?: {
    products: number;
  };
}

interface CategoryListProps {
  categories: Category[];
  loading: boolean;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
  selectedCategory?: Category | null;
  onSelect?: (category: Category) => void;
  placeholder?: string;
}

export default function CategoryList({
  categories,
  loading,
  onEdit,
  onDelete,
  selectedCategory = null,
  onSelect,
  placeholder = "Select a category",
}: CategoryListProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isOpen) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isOpen]);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    setExpandedId(null);
  };

  const handleSelect = (category: Category) => {
    if (onSelect) {
      onSelect(category);
      setIsOpen(false);
      setExpandedId(null);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [300, 0],
  });

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.dropdownButton}
        onPress={toggleDropdown}
        activeOpacity={0.7}
      >
        <View style={styles.buttonContent}>
          <View style={styles.selectedInfo}>
            {selectedCategory ? (
              <>
                <Text style={styles.selectedText}>{selectedCategory.name}</Text>
                <Text style={styles.selectedCount}>
                  {selectedCategory._count?.products ?? 0} products
                </Text>
              </>
            ) : (
              <Text style={styles.placeholderText}>{placeholder}</Text>
            )}
          </View>
          <MaterialIcons
            name={isOpen ? "keyboard-arrow-up" : "keyboard-arrow-down"}
            size={24}
            color="#6b7280"
          />
        </View>
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent
        animationType="none"
        onRequestClose={toggleDropdown}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={toggleDropdown}
        >
          <Animated.View
            style={[styles.modalBackground, { opacity: fadeAnim }]}
          />
        </TouchableOpacity>

        <Animated.View
          style={[
            styles.dropdownContainer,
            {
              transform: [{ translateY }],
            },
          ]}
        >
          <View style={styles.dropdownHeader}>
            <Text style={styles.dropdownTitle}>Categories</Text>
            <TouchableOpacity
              onPress={toggleDropdown}
              style={styles.closeButton}
            >
              <MaterialIcons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          {categories.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialIcons name="inbox" size={48} color="#d1d5db" />
              <Text style={styles.emptyText}>No categories yet</Text>
              <Text style={styles.emptySubText}>
                Add your first category to get started
              </Text>
            </View>
          ) : (
            <ScrollView
              style={styles.scrollView}
              showsVerticalScrollIndicator={false}
            >
              {categories.map((item) => (
                <View key={item.id} style={styles.itemContainer}>
                  <TouchableOpacity
                    style={[
                      styles.categoryItem,
                      selectedCategory?.id === item.id &&
                        styles.categoryItemSelected,
                    ]}
                    onPress={() => handleSelect(item)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.itemLeft}>
                      <View style={styles.itemInfo}>
                        <Text style={styles.itemName}>{item.name}</Text>
                        <Text style={styles.itemCount}>
                          {item._count?.products ?? 0} products
                        </Text>
                      </View>
                    </View>

                    <TouchableOpacity
                      style={styles.moreButton}
                      onPress={(e) => {
                        e.stopPropagation();
                        toggleExpand(item.id);
                      }}
                    >
                      <MaterialIcons
                        name="more-vert"
                        size={20}
                        color="#6b7280"
                      />
                    </TouchableOpacity>
                  </TouchableOpacity>

                  {expandedId === item.id && (
                    <View style={styles.actionsContainer}>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => {
                          onEdit(item);
                          setExpandedId(null);
                        }}
                      >
                        <Feather name="edit" size={18} color="#2563eb" />
                        <Text style={styles.actionText}>Edit</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => {
                          onDelete(item);
                          setExpandedId(null);
                        }}
                      >
                        <Feather name="trash-2" size={18} color="#dc2626" />
                        <Text style={[styles.actionText, styles.deleteText]}>
                          Delete
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              ))}
            </ScrollView>
          )}
        </Animated.View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    zIndex: 1000,
    padding: 14,
  },
  dropdownButton: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  selectedInfo: {
    flex: 1,
  },
  selectedText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 2,
  },
  selectedCount: {
    fontSize: 13,
    color: "#6b7280",
  },
  placeholderText: {
    fontSize: 16,
    color: "#9ca3af",
  },
  modalOverlay: {
    flex: 1,
  },
  modalBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#000",
    opacity: 0.5,
  },
  dropdownContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "75%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  dropdownHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  dropdownTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1f2937",
  },
  closeButton: {
    padding: 4,
  },
  scrollView: {
    maxHeight: 400,
  },
  itemContainer: {
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  categoryItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    paddingHorizontal: 20,
  },
  categoryItemSelected: {
    backgroundColor: "#eff6ff",
  },
  itemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#d1d5db",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  radioOuterSelected: {
    borderColor: "#2563eb",
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#2563eb",
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 2,
  },
  itemCount: {
    fontSize: 13,
    color: "#6b7280",
  },
  moreButton: {
    padding: 8,
  },
  actionsContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#f9fafb",
    gap: 12,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "#ffffff",
    borderRadius: 8,
    gap: 8,
    flex: 1,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  actionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2563eb",
  },
  deleteText: {
    color: "#dc2626",
  },
  emptyContainer: {
    padding: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
});
