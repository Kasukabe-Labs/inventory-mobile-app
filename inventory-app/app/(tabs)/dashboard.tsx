import Header from "@/components/dashboard/header";
import SearchBar from "@/components/dashboard/searchBar";
import ProductList from "@/components/ProductList";
import React, { useState } from "react";
import { RefreshControl, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Dashboard() {
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = () => {};

  return (
    <View className="flex-1 bg-background">
      <Header />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <ProductList />
      </ScrollView>
    </View>
  );
}
