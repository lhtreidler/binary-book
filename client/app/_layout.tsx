import { Stack } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";

import { SessionProvider, useIsLoggedIn } from "@/session/ctx";
import { SplashScreenController } from "@/components/splash";
import { initializeApiClient } from "@/lib/api";

import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import "@/global.css";

const queryClient = new QueryClient();

export default function Root() {
  // Initialize API client on app start
  useEffect(() => {
    initializeApiClient().catch((error) => {
      console.error("Failed to initialize API client:", error);
    });
  }, []);

  // Set up the auth context and render your layout inside of it.
  return (
    <QueryClientProvider client={queryClient}>
      <GluestackUIProvider mode="light">
        <SessionProvider>
          <SplashScreenController />
          <RootNavigator />
        </SessionProvider>
      </GluestackUIProvider>
    </QueryClientProvider>
  );
}

function RootNavigator() {
  const isLoggedIn = useIsLoggedIn();
  console.log("User logged in:", isLoggedIn);

  return (
    <Stack>
      <Stack.Protected guard={isLoggedIn}>
        <Stack.Screen name="(app)" />
      </Stack.Protected>
      <Stack.Protected guard={!isLoggedIn}>
        <Stack.Screen name="sign-in" />
      </Stack.Protected>
    </Stack>
  );
}
