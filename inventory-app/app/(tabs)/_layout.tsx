import { Tabs } from "expo-router";
import Feather from "@expo/vector-icons/Feather";
import AntDesign from "@expo/vector-icons/AntDesign";
import { PortalHost } from "@rn-primitives/portal";
import { useAuthStore } from "@/store/useAuthStore";
import { useColorScheme } from "react-native";

export default function TabsLayout() {
  const user = useAuthStore((state) => state.user);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: isDark ? "#000000" : "#ffffff",
          },
          tabBarActiveTintColor: isDark ? "#ffffff" : "#000000",
          tabBarInactiveTintColor: isDark ? "#71717a" : "#a1a1aa",
        }}
      >
        <Tabs.Screen
          name="inventory"
          options={{
            title: "Inventory",
            tabBarIcon: ({ size, color }) => (
              <AntDesign name="product" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="scanner"
          options={{
            title: "Scan",
            tabBarIcon: ({ size, color }) => (
              <AntDesign name="scan" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="analytics"
          options={{
            title: "Analytics",
            tabBarIcon: ({ size, color }) => (
              <AntDesign name="area-chart" size={size} color={color} />
            ),
            // Hide the tab for non-admin users
            href: user?.role === "ADMIN" ? "/analytics" : null,
          }}
        />
      </Tabs>
      <PortalHost />
    </>
  );
}
