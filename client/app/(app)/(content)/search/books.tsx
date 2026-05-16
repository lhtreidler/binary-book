import { useBookSearchPage } from "@/components/book-autocomplete/hooks";
import { Option } from "@/components/autocomplete/Options";
import { AutocompleteOption } from "@/components/autocomplete/types";
import { InfiniteList } from "@/components/elements";
import { RankingModal } from "@/components/ranking-modal/RankingModal";
import { Stack, useLocalSearchParams } from "expo-router";
import { ListRenderItem } from "react-native";

const renderItem: ListRenderItem<AutocompleteOption> = ({ item }) => (
  <Option {...item} />
);

const keyExtractor = (item: AutocompleteOption) => item.id;

export default function BookSearchScreen() {
  const { q = "" } = useLocalSearchParams<{ q: string }>();
  const { infiniteQuery, options, modalProps } = useBookSearchPage(q);

  const {
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = infiniteQuery;

  return (
    <>
      <Stack.Screen options={{ title: `Results for "${q}"`, headerBackTitle: "Back" }} />
      <InfiniteList
        items={options}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        isLoading={isLoading}
        isError={isError}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        isRefetching={isRefetching}
        fetchNextPage={fetchNextPage}
        refetch={refetch}
        emptyMessage="No books found."
        errorMessage="Failed to load results. Please try again."
      />
      <RankingModal {...modalProps} />
    </>
  );
}
