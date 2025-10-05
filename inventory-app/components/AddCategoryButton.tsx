import { TouchableOpacity, Text, StyleSheet } from "react-native";
import Feather from "@expo/vector-icons/Feather";

interface AddCategoryButtonProps {
  onPress: () => void;
}

export default function AddCategoryButton({ onPress }: AddCategoryButtonProps) {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Feather name="plus" size={20} color="#ffffff" />
      <Text style={styles.buttonText}>Add Category</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#2563eb",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 14,
    borderRadius: 12,
    gap: 8,
    shadowColor: "#2563eb",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});
