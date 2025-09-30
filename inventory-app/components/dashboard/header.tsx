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
      <View className="absolute top-8 left-0 right-0 z-50 flex-row items-center justify-between px-2 py-6 ">
        {/* Left: Avatar */}
        <Avatar
          alt="@shadcn"
          className="size-10 rounded-lg border-2 border-background web:border-0 web:ring-2 web:ring-background ml-2"
        >
          <AvatarImage source={{ uri: "https://github.com/shadcn.png" }} />
          <AvatarFallback>
            <Text>CN</Text>
          </AvatarFallback>
        </Avatar>

        {/* Right: Menu button */}
        <Button variant="ghost">
          <Feather name="menu" size={24} color="black" />
        </Button>
      </View>
      <View className="flex-row items-center justify-center gap-2">
        <Text variant={"h4"}>Hi {user?.email}</Text>
        <Badge variant="secondary" className="bg-blue-500 dark:bg-blue-600">
          <Icon as={User} className="text-white" />
          <Text className="text-white">{user?.role}</Text>
        </Badge>
      </View>
    </>
  );
}
