import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  Pressable,
} from "react-native";
import { Text } from "@/components/ui/text";
import { ChevronDown, Check } from "lucide-react-native";

interface CategoryOption {
  id: string;
  name: string;
}

interface NativeCategoryDropdownProps {
  value: string;
  onValueChange: (categoryId: string) => void;
  categories: CategoryOption[];
  placeholder?: string;
  label?: string;
  disabled?: boolean;
}

export function NativeCategoryDropdown({
  value,
  onValueChange,
  categories,
  placeholder = "Select a category",
  label,
  disabled = false,
}: NativeCategoryDropdownProps) {
  const [modalVisible, setModalVisible] = useState(false);

  const selectedCategory = categories.find((cat) => cat.id === value);
  const displayText = selectedCategory ? selectedCategory.name : placeholder;

  const handleSelect = (categoryId: string) => {
    onValueChange(categoryId);
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}

      <TouchableOpacity
        style={[styles.trigger, disabled && styles.triggerDisabled]}
        onPress={() => !disabled && setModalVisible(true)}
        activeOpacity={0.7}
        disabled={disabled}
      >
        <Text
          style={[
            styles.triggerText,
            !selectedCategory && styles.placeholderText,
          ]}
        >
          {displayText}
        </Text>
        <ChevronDown size={20} color="#6B7280" />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
        >
          <Pressable
            style={styles.modalContent}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Category</Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>Done</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={categories}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.option}
                  onPress={() => handleSelect(item.id)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.optionText,
                      item.id === value && styles.selectedOptionText,
                    ]}
                  >
                    {item.name}
                  </Text>
                  {item.id === value && <Check size={20} color="#3B82F6" />}
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              showsVerticalScrollIndicator={true}
              contentContainerStyle={styles.listContent}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 8,
  },
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 48,
  },
  triggerDisabled: {
    backgroundColor: "#F3F4F6",
    opacity: 0.6,
  },
  triggerText: {
    fontSize: 16,
    color: "#111827",
    flex: 1,
  },
  placeholderText: {
    color: "#9CA3AF",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "70%",
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  closeButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  closeButtonText: {
    fontSize: 16,
    color: "#3B82F6",
    fontWeight: "500",
  },
  listContent: {
    paddingVertical: 8,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  optionText: {
    fontSize: 16,
    color: "#374151",
    flex: 1,
  },
  selectedOptionText: {
    color: "#3B82F6",
    fontWeight: "500",
  },
  separator: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginHorizontal: 20,
  },
});
