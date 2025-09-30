import { View } from "react-native";
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import Feather from "@expo/vector-icons/Feather";
import { Button } from "../ui/button";
import { Text } from "../ui/text";
import { Badge } from "../ui/badge";
import { User } from "lucide-react-native";

import { Icon } from "../ui/icon";
import { useAuthStore } from "@/store/useAuthStore";

export default function Header() {
  const user = useAuthStore((state) => state.user);

  return (
    <>
      {/* Top bar with avatar + menu */}
      <View className="absolute top-8 left-0 right-0 z-50 flex-row items-center justify-between px-2 py-6">
        <Avatar
          alt="@shadcn"
          className="size-10 rounded-lg border-2 border-background web:border-0 web:ring-2 web:ring-background ml-2"
        >
          <AvatarImage source={{ uri: "https://github.com/shadcn.png" }} />
          <AvatarFallback>
            <Text>CN</Text>
          </AvatarFallback>
        </Avatar>

        <Button variant="ghost">
          <Feather name="menu" size={24} color="black" />
        </Button>
      </View>

      {/* Greeting + role badge + email, left-aligned */}
      <View className="mt-32 flex-col items-start px-4 gap-1 w-full">
        <View className="flex-row items-center gap-2">
          <Text variant={"h1"}>Welcome</Text>
          {user?.role && (
            <Badge
              variant="secondary"
              className={`mt-1 ${
                user?.role === "ADMIN"
                  ? "bg-emerald-500 dark:bg-emerald-600"
                  : "bg-blue-500 dark:bg-blue-600"
              }`}
            >
              <Icon as={User} className="text-white" />
              <Text className="text-white">{user?.role}</Text>
            </Badge>
          )}
        </View>

        {/* Email below */}
        {user?.email && (
          <Text variant={"muted"} className="mt-1">
            Your email: {user.email}
          </Text>
        )}
      </View>
    </>
  );
}
