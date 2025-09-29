import { Tabs } from "expo-router";
import Feather from "@expo/vector-icons/Feather";

export default function TabsLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ size }) => (
            <Feather name="home" size={size} color="black" />
          ),
        }}
      />
      <Tabs.Screen
        name="login"
        options={{
          title: "Login",
          tabBarIcon: ({ size }) => (
            <Feather name="user" size={size} color="black" />
          ),
        }}
      />
    </Tabs>
  );
}
