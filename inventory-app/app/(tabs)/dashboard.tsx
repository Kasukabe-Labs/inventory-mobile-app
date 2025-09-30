import Header from "@/components/dashboard/header";
import SearchBar from "@/components/dashboard/searchBar";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Dashboard() {
  return (
    <SafeAreaView className="min-h-screen w-full justify-center items-center flex bg-black/50">
      <Header />
      <SearchBar />
    </SafeAreaView>
  );
}
