import { useState } from "react";
import { View } from "react-native";
import { useCategories } from "@/hooks/useCategories";
import CategoryList from "@/components/CategoryList";
import AddCategoryButton from "@/components/AddCategoryButton";
import AddCategoryModal from "@/components/AddCategoryModal";
import EditCategoryModal from "@/components/EditCategoryModal";
import DeleteCategoryModal from "@/components/DeleteCategoryModal";

interface Category {
  id: string;
  name: string;
}

export default function CategoriesScreen() {
  const { categories, loading, addCategory, editCategory, deleteCategory } =
    useCategories();

  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#f9fafb" }}>
      <CategoryList
        categories={categories}
        loading={loading}
        onEdit={(cat) => {
          setSelectedCategory(cat);
          setEditModalVisible(true);
        }}
        onDelete={(cat) => {
          setSelectedCategory(cat);
          setDeleteModalVisible(true);
        }}
      />

      <View style={{ padding: 16 }}>
        <AddCategoryButton onPress={() => setAddModalVisible(true)} />
      </View>

      <AddCategoryModal
        visible={addModalVisible}
        onClose={() => setAddModalVisible(false)}
        onAdd={addCategory}
      />

      <EditCategoryModal
        visible={editModalVisible}
        category={selectedCategory}
        onClose={() => setEditModalVisible(false)}
        onSave={editCategory}
      />

      <DeleteCategoryModal
        visible={deleteModalVisible}
        category={selectedCategory}
        onClose={() => setDeleteModalVisible(false)}
        onConfirm={deleteCategory}
      />
    </View>
  );
}
