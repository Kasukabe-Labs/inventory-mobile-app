import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEmployees } from "@/hooks/useEmployees";
import { useCategories } from "@/hooks/useCategories";
import { EmployeeList } from "@/components/EmployeeList";
import AddEmployeeButton from "@/components/AddEmployeeButton";

import EditEmployeeModal from "@/components/EditEmployeeModal";
import CategoryList from "@/components/CategoryList";
import AddCategoryButton from "@/components/AddCategoryButton";
import AddCategoryModal from "@/components/AddCategoryModal";
import EditCategoryModal from "@/components/EditCategoryModal";
import DeleteCategoryModal from "@/components/DeleteCategoryModal";
import { AddEmployeeModal } from "@/components/AddEmployeeModal";
import { ConfirmDeleteModal } from "@/components/ConfirmDeleteModal";

interface Employee {
  id: string;
  name: string;
  email: string;
}

interface Category {
  id: string;
  name: string;
}

export default function SettingsScreen() {
  const {
    employees,
    loading: employeesLoading,
    addEmployee,
    deleteEmployee,
    editEmployee,
  } = useEmployees();
  const {
    categories,
    loading: categoriesLoading,
    addCategory,
    editCategory,
    deleteCategory,
  } = useCategories();

  // Employee modals
  const [showAddEmployeeModal, setShowAddEmployeeModal] = useState(false);
  const [showEditEmployeeModal, setShowEditEmployeeModal] = useState(false);
  const [showDeleteEmployeeModal, setShowDeleteEmployeeModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null
  );

  // Category modals
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [showEditCategoryModal, setShowEditCategoryModal] = useState(false);
  const [showDeleteCategoryModal, setShowDeleteCategoryModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );

  // Handle edit click
  const handleEditEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setShowEditEmployeeModal(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Employees Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Employees</Text>
          <View style={styles.buttonContainer}>
            <AddEmployeeButton onPress={() => setShowAddEmployeeModal(true)} />
          </View>
          <EmployeeList
            employees={employees}
            loading={employeesLoading}
            onEdit={handleEditEmployee}
            onDelete={(emp) => {
              setSelectedEmployee(emp);
              setShowDeleteEmployeeModal(true);
            }}
          />
        </View>

        {/* Categories Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <View style={styles.buttonContainer}>
            <AddCategoryButton onPress={() => setShowAddCategoryModal(true)} />
          </View>
          <CategoryList
            categories={categories}
            loading={categoriesLoading}
            onEdit={(cat) => {
              setSelectedCategory(cat);
              setShowEditCategoryModal(true);
            }}
            onDelete={(cat) => {
              setSelectedCategory(cat);
              setShowDeleteCategoryModal(true);
            }}
          />
        </View>
      </ScrollView>

      {/* Employee Modals */}
      <AddEmployeeModal
        visible={showAddEmployeeModal}
        onClose={() => setShowAddEmployeeModal(false)}
        onAdd={addEmployee}
      />

      <EditEmployeeModal
        visible={showEditEmployeeModal}
        employee={selectedEmployee}
        onClose={() => setShowEditEmployeeModal(false)}
        onSave={editEmployee}
      />

      <ConfirmDeleteModal
        visible={showDeleteEmployeeModal}
        employee={selectedEmployee}
        onClose={() => setShowDeleteEmployeeModal(false)}
        onConfirm={deleteEmployee}
      />

      {/* Category Modals */}
      <AddCategoryModal
        visible={showAddCategoryModal}
        onClose={() => setShowAddCategoryModal(false)}
        onAdd={addCategory}
      />

      <EditCategoryModal
        visible={showEditCategoryModal}
        category={selectedCategory}
        onClose={() => setShowEditCategoryModal(false)}
        onSave={editCategory}
      />

      <DeleteCategoryModal
        visible={showDeleteCategoryModal}
        category={selectedCategory}
        onClose={() => setShowDeleteCategoryModal(false)}
        onConfirm={deleteCategory}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1f2937",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  buttonContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
});
