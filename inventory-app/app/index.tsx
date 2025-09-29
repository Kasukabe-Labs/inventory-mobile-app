import { View, Text } from "react-native";
import React from "react";
import { SignInForm } from "@/components/sign-in-form";

export default function index() {
  return (
    <View className="flex-1 bg-black">
      <SignInForm />
    </View>
  );
}
