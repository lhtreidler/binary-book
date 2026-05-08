import { Box } from "@/components/ui/box";
import { HStack } from "@/components/ui/hstack";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { BookListItem } from "@/lib/api";
import { useBookList } from "@/lib/api/hooks/useBooks";
import { useMemo } from "react";
import { FlatList, ListRenderItem } from "react-native";

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

  const items = useMemo(
    () => data?.pages.flatMap((p) => p.list) ?? [],
    [data],
  );

  const renderItem: ListRenderItem<BookListItem> = ({ item }) => (
    <Row item={item} />
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
        <Text>Failed to load list. Please try again later.</Text>
      </Box>
    );
  }

  return (
    <Box className="flex-1">
      <FlatList
        data={items}
        keyExtractor={(_, index) => String(index)}
        renderItem={renderItem}
        onRefresh={refetch}
        refreshing={isRefetching && !isFetchingNextPage}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
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
            <Text className="text-typography-500">No ranked books yet.</Text>
          </Box>
        }
      />
    </Box>
  );
}
