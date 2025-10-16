// Inventory.js
import React, { useState } from "react";
import { ScrollView, RefreshControl, StyleSheet } from "react-native";
import Header from "@/components/dashboard/header";
import ProductList from "@/components/ProductList";

export default function Inventory() {
  const [refreshing, setRefreshing] = useState(false);
  const [reloadKey, setReloadKey] = useState(0); // used to force re-render

  const onRefresh = () => {
    setRefreshing(true);
    // Increment reloadKey to force re-render
    setReloadKey((prev) => prev + 1);
    setRefreshing(false);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Header />
      {/* Pass reloadKey as key to ProductList to force remount */}
      <ProductList key={reloadKey} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  // main scroll view container
  container: {
    flex: 1,
    backgroundColor: "#ffffff", // bgColor ffffff
  },
  // ensures content can grow and stretch when content is small
  contentContainer: {
    flexGrow: 1,
  },
});
