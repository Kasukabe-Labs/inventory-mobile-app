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
      <View className="absolute top-0 left-0 right-0 z-50 flex-row items-center justify-between px-2 pt-14 pb-6 bg-background border-b border-border">
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
    </>
  );
}
