import { useMemo } from "react";
import { FlatList, ListRenderItem } from "react-native";
import { Box } from "@/components/ui/box";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { useFollowList } from "@/lib/api/hooks/useFollows";
import { FollowListUser } from "@/lib/api/types";
import { FollowListItem } from "./FollowListItem";
import { FollowListProps } from "./types";

export function FollowList({ type, userId, isSelf }: FollowListProps) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useFollowList({ type, userId });

  const items = useMemo(
    () => data?.pages.flatMap((p) => p.result) ?? [],
    [data],
  );

  const itemAction = isSelf
    ? type === "followers"
      ? "follow"
      : "unfollow"
    : undefined;

  const renderItem: ListRenderItem<FollowListUser> = ({ item }) => (
    <FollowListItem item={item} action={itemAction} />
  );

  if (isLoading) {
    return (
      <Box className="flex-1 items-center justify-center">
        <Spinner />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box className="flex-1 items-center justify-center px-4">
        <Text>Failed to load. Please try again.</Text>
      </Box>
    );
  }

  return (
    <Box className="flex-1">
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        onRefresh={refetch}
        refreshing={isRefetching && !isFetchingNextPage}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) fetchNextPage();
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isFetchingNextPage ? (
            <Box className="py-4">
              <Spinner />
            </Box>
          ) : null
        }
        ListEmptyComponent={
          <Box className="items-center justify-center py-10">
            <Text className="text-typography-500">No {type} yet.</Text>
          </Box>
        }
      />
    </Box>
  );
}
