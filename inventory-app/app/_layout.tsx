import { AppHydration } from "@/components/AppHydration";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import "@/global.css";
import { PortalHost } from "@rn-primitives/portal";
import { Stack } from "expo-router";

export default function RootLayout() {
  const queryClient = new QueryClient();

  return (
    <AppHydration>
      <QueryClientProvider client={queryClient}>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="settings" options={{ headerShown: false }} />
          <Stack.Screen name="products/[id]" options={{ headerShown: false }} />
        </Stack>
        <PortalHost />
      </QueryClientProvider>
    </AppHydration>
  );
}
