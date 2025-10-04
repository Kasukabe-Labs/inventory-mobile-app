import Header from "@/components/dashboard/header";
import ProductList from "@/components/ProductList";
import { useState } from "react";
import { ScrollView, RefreshControl } from "react-native";

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
      className="flex-1 bg-background"
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
