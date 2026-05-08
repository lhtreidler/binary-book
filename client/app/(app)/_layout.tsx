import { Stack } from "expo-router";

export default function App() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="book/[bookId]" options={{ title: "" }} />
    </Stack>
  );
}
