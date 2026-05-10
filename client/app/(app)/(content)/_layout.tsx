import { Stack } from "expo-router";

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerTitle: "Binary Book" }} />
      <Stack.Screen
        name="book"
        options={{ headerBackTitle: "Back", headerTitle: "" }}
      />
    </Stack>
  );
}
