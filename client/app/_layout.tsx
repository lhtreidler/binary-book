import { Stack } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";

import { SessionProvider } from "@/session/ctx";
import { SplashScreenController } from "@/components/splash";
import { initializeApiClient } from "@/lib/api";

import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import "@/global.css";
import { Center } from "@/components/ui/center";
import { Spinner } from "@/components/ui/spinner";
import { useIsLoggedIn } from "@/lib/api/hooks/useAuth";

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
  const { isLoading, isLoggedIn } = useIsLoggedIn();

  if (isLoading) {
    return (
      <Center className="h-3/4 px-2">
        <Spinner />
      </Center>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!isLoggedIn}>
        <Stack.Screen name="signin" />
      </Stack.Protected>
      <Stack.Protected guard={isLoggedIn}>
        <Stack.Screen name="(app)" />
      </Stack.Protected>
    </Stack>
  );
}
