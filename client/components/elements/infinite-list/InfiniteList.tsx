import { FlatList, ListRenderItem } from "react-native";
import { Box } from "@/components/ui/box";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";

type Props<T> = {
  items: T[];
  renderItem: ListRenderItem<T>;
  keyExtractor: (item: T, index: number) => string;
  isLoading: boolean;
  isError: boolean;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  isRefetching: boolean;
  fetchNextPage: () => void;
  refetch: () => void;
  emptyMessage?: string;
  errorMessage?: string;
};

export function InfiniteList<T>({
  items,
  renderItem,
  keyExtractor,
  isLoading,
  isError,
  hasNextPage,
  isFetchingNextPage,
  isRefetching,
  fetchNextPage,
  refetch,
  emptyMessage = "Nothing here yet.",
  errorMessage = "Failed to load. Please try again.",
}: Props<T>) {
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
        <Text>{errorMessage}</Text>
      </Box>
    );
  }

  return (
    <Box className="flex-1">
      <FlatList
        data={items}
        keyExtractor={keyExtractor}
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
            <Text className="text-typography-500">{emptyMessage}</Text>
          </Box>
        }
      />
    </Box>
  );
}
