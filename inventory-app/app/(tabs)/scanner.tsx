import { Text } from "@/components/ui/text";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Scanner() {
  return (
    <SafeAreaView className="min-h-screen w-full justify-center items-center flex  bg-black/50">
      <Text variant={"h1"}>Scanner</Text>
    </SafeAreaView>
  );
}
