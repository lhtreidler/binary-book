import { HStack } from "@/components/ui/hstack";
import { Pressable } from "@/components/ui/pressable";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { InfiniteList } from "@/components/elements";
import { BookListItem } from "@/lib/api";
import { useBookList } from "@/lib/api/hooks/useBooks";
import { router } from "expo-router";
import { useMemo } from "react";
import { ListRenderItem } from "react-native";

const scoreColorClass = (score: number) => {
  if (score >= 6.7) return "text-success-700";
  if (score >= 3.3) return "text-warning-600";
  return "text-error-600";
};

const Row = ({ item }: { item: BookListItem }) => {
  const authorStr = item.authors.length
    ? item.authors.join(", ")
    : "Unknown Author";

  return (
    <Pressable onPress={() => router.push(`/book/${item.bookId}`)}>
      <HStack className="items-center justify-between border-b border-outline-200 px-4 py-3">
        <VStack className="flex-1 pr-3">
          <Text className="font-semibold" numberOfLines={2}>
            {item.title}
          </Text>
          <Text size="sm" className="text-typography-500" numberOfLines={1}>
            {authorStr}
          </Text>
        </VStack>
        <Text bold size="lg" className={scoreColorClass(item.score)}>
          {item.score.toFixed(1)}
        </Text>
      </HStack>
    </Pressable>
  );
};

export default function List() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useBookList();

  const items = useMemo(() => data?.pages.flatMap((p) => p.list) ?? [], [data]);

  const renderItem: ListRenderItem<BookListItem> = ({ item }) => (
    <Row item={item} />
  );

  return (
    <InfiniteList
      items={items}
      renderItem={renderItem}
      keyExtractor={(_, index) => String(index)}
      isLoading={isLoading}
      isError={isError}
      hasNextPage={hasNextPage}
      isFetchingNextPage={isFetchingNextPage}
      isRefetching={isRefetching}
      fetchNextPage={fetchNextPage}
      refetch={refetch}
      emptyMessage="No ranked books yet."
      errorMessage="Failed to load list. Please try again later."
    />
  );
}
