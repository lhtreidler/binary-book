import { FollowList } from "@/components/page-layouts/follow-list";
import { Stack, useLocalSearchParams } from "expo-router";

export default function FollowListScreen() {
  const { type, userId, username } = useLocalSearchParams<{
    type: string;
    userId?: string;
    username?: string;
  }>();

  if (type !== "followers" && type !== "following") return null;

  const isSelf = !userId;
  const listLabel = type === "followers" ? "Followers" : "Following";
  const title = isSelf
    ? `Your ${listLabel}`
    : `${username ? `${username}'s` : "Their"} ${listLabel}`;

  return (
    <>
      <Stack.Screen options={{ title, headerBackTitle: "Back" }} />
      <FollowList type={type} userId={userId} isSelf={isSelf} />
    </>
  );
}
