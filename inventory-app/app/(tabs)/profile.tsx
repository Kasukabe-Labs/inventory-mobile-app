import { Text } from "@/components/ui/text";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Profile() {
  return (
    <SafeAreaView className="min-h-screen w-full justify-center items-center flex">
      <Text variant={"h1"}>Profile</Text>
    </SafeAreaView>
  );
}
