import { Alert, View } from "react-native";
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Button } from "../ui/button";
import { Text } from "../ui/text";
import { useAuthStore } from "@/store/useAuthStore";
import { router } from "expo-router";
import { Badge } from "../ui/badge";

export default function Header() {
  const user = useAuthStore((state) => state.user);
  const clearUser = useAuthStore((state) => state.clearUser);

  function logoutUser() {
    clearUser();
    Alert.alert("User Logged Out", "Please login again to gain access");
    router.push("/");
  }

  return (
    <>
      {/* Top bar with avatar + menu */}
      <View className="absolute top-0 left-0 right-0 z-50 flex-row items-center justify-between px-2 pt-14 pb-6 bg-background border-b border-border gap-10">
        <View className="flex flex-row gap-2">
          <Avatar
            alt="@shadcn"
            className="size-10 rounded-lg border-2 border-background web:border-0 web:ring-2 web:ring-background ml-2"
          >
            <AvatarImage source={{ uri: "https://github.com/shadcn.png" }} />
            <AvatarFallback>
              <Text>CN</Text>
            </AvatarFallback>
          </Avatar>
          <View className="flex justify-center items-start">
            <View className=" flex-row justify-center items-center gap-1">
              <Text variant={"large"}>Welcome</Text>
              <Badge>
                <Text>{user?.role}</Text>
              </Badge>
            </View>
            <Text variant={"small"}>{user?.email}</Text>
          </View>
        </View>

        <View className="flex flex-row justify-center items-center gap-2">
          <Button size="icon">
            <MaterialIcons name="settings" size={15} color="white" />{" "}
          </Button>
          <Button onPress={logoutUser} variant="destructive" size="icon">
            <MaterialIcons name="logout" size={15} color="white" />{" "}
          </Button>
        </View>
      </View>
    </>
  );
}
