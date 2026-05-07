import { Stack } from "expo-router";

import { SessionProvider, useIsLoggedIn } from "@/session/ctx";
import { SplashScreenController } from "@/components/splash";

import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import "@/global.css";

export default function Root() {
  // Set up the auth context and render your layout inside of it.
  return (
    <GluestackUIProvider mode="light">
      <SessionProvider>
        <SplashScreenController />
        <RootNavigator />
      </SessionProvider>
    </GluestackUIProvider>
  );
}

function RootNavigator() {
  const isLoggedIn = useIsLoggedIn();

  console.log("session", isLoggedIn);

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
