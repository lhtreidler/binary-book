import { useMemo } from "react";
import { ListRenderItem } from "react-native";
import { InfiniteList } from "@/components/elements";
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

  return (
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
      emptyMessage={`No ${type} yet.`}
    />
  );
}
