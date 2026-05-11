import { useIsAccountSetUp } from "@/lib/api/hooks";
import { Stack } from "expo-router";

export default function App() {
  const { isAccountSetUp } = useIsAccountSetUp();

  return (
    <Stack>
      <Stack.Protected guard={!isAccountSetUp}>
        <Stack.Screen name="setupAccount" options={{ headerShown: false }} />
      </Stack.Protected>
      <Stack.Protected guard={isAccountSetUp}>
        <Stack.Screen name="(content)" options={{ headerShown: false }} />
      </Stack.Protected>
    </Stack>
  );
}
