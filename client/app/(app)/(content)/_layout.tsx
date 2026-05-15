import { Stack } from "expo-router";

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerTitle: "Binary Book" }} />
      <Stack.Screen
        name="book/[bookId]"
        options={{ headerBackTitle: "Back", headerTitle: "" }}
      />
      <Stack.Screen name="follow/[type]" />
      <Stack.Screen name="search/books" options={{ headerBackTitle: "Back" }} />
      <Stack.Screen name="search/users" options={{ headerBackTitle: "Back" }} />
    </Stack>
  );
}
