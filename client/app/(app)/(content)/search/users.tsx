import { InfiniteList } from "@/components/elements";
import { FollowListItem } from "@/components/page-layouts/follow-list/FollowListItem";
import { useSearchUsersInfinite } from "@/lib/api/hooks";
import { SearchUserResponse, UserSearchItem } from "@/lib/api";
import { Stack, useLocalSearchParams } from "expo-router";
import { useMemo } from "react";
import { ListRenderItem } from "react-native";

export default function UserSearchScreen() {
  const { q = "" } = useLocalSearchParams<{ q: string }>();
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useSearchUsersInfinite({ username: q });

  const items = useMemo(
    () => data?.pages.flatMap((p: SearchUserResponse) => p.users) ?? [],
    [data],
  );

  const renderItem: ListRenderItem<UserSearchItem> = ({ item }) => (
    <FollowListItem item={item} />
  );

  return (
    <>
      <Stack.Screen
        options={{ title: `Results for "${q}"`, headerBackTitle: "Back" }}
      />
      <InfiniteList
        items={items}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        isLoading={isLoading}
        isError={isError}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        isRefetching={isRefetching}
        fetchNextPage={fetchNextPage}
        refetch={refetch}
        emptyMessage="No users found."
        errorMessage="Failed to load results. Please try again."
      />
    </>
  );
}
