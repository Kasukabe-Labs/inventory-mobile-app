import { useState, useEffect } from "react";
import { Alert } from "react-native";
import { useAuthStore } from "@/store/useAuthStore";
import { useCategoryStore } from "@/store/useCategoryStore";
import { API_URL } from "@/constants/api";

export function useCategories() {
  const user = useAuthStore((state) => state.user);
  const token = user?.token;

  const { categories, setCategories } = useCategoryStore();

  const [loading, setLoading] = useState(false);

  // 🔹 Fetch all categories
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/categories/get-all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setCategories(data.data || []);
      } else {
        Alert.alert("Error", data.message || "Failed to fetch categories.");
      }
    } catch (error) {
      console.error("Fetch categories error:", error);
      Alert.alert("Error", "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const addCategory = async (name: string) => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/categories/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name }),
      });

      const data = await res.json();
      if (res.ok) {
        setCategories([...categories, data.category]);
        Alert.alert("Success", "Category added successfully.");
      } else {
        Alert.alert("Error", data.message || "Failed to add category.");
      }
    } catch (error) {
      console.error("Add category error:", error);
      Alert.alert("Error", "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Edit category
  const editCategory = async (id: string, newName: string) => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/categories/edit`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id, name: newName }),
      });

      const data = await res.json();
      if (res.ok) {
        setCategories(
          categories.map((cat) =>
            cat.id === id ? { ...cat, name: newName } : cat
          )
        );
        Alert.alert("Success", "Category updated successfully.");
      } else {
        Alert.alert("Error", data.message || "Failed to update category.");
      }
    } catch (error) {
      console.error("Edit category error:", error);
      Alert.alert("Error", "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Delete category (and all its products)
  const deleteCategory = async (id: string) => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/categories/delete`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id }),
      });

      const data = await res.json();
      if (res.ok) {
        setCategories(categories.filter((cat) => cat.id !== id));
        Alert.alert("Deleted", "Category and its products deleted.");
      } else {
        Alert.alert("Error", data.message || "Failed to delete category.");
      }
    } catch (error) {
      console.error("Delete category error:", error);
      Alert.alert("Error", "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchCategories();
  }, [token]);

  return {
    categories,
    loading,
    fetchCategories,
    addCategory,
    editCategory,
    deleteCategory,
  };
}
