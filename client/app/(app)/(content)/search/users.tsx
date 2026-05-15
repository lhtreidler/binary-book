import { Option } from "@/components/autocomplete/Options";
import { AutocompleteOption } from "@/components/autocomplete/types";
import { InfiniteList } from "@/components/elements";
import { useSearchUsersInfinite } from "@/lib/api/hooks";
import { SearchUserResponse, UserSearchItem } from "@/lib/api";
import { Stack, useLocalSearchParams } from "expo-router";
import { useMemo } from "react";
import { ListRenderItem } from "react-native";

const renderItem: ListRenderItem<AutocompleteOption> = ({ item }) => (
  <Option {...item} />
);

const keyExtractor = (item: AutocompleteOption) => item.id;

const mapUserToOption = ({
  id,
  username,
  profileImg,
  firstName,
  lastName,
}: UserSearchItem): AutocompleteOption => ({
  id,
  label: username ?? id,
  avatarProps: { profileImg, firstName, lastName },
  href: `/profile/${id}`,
});

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

  const options = useMemo(() => {
    const seen = new Set<string>();
    return (
      data?.pages
        .flatMap((p: SearchUserResponse) => p.users.map(mapUserToOption))
        .filter(({ id }) => {
          if (seen.has(id)) return false;
          seen.add(id);
          return true;
        }) ?? []
    );
  }, [data]);

  return (
    <>
      <Stack.Screen
        options={{ title: `Results for "${q}"`, headerBackTitle: "Back" }}
      />
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
        emptyMessage="No users found."
        errorMessage="Failed to load results. Please try again."
      />
    </>
  );
}
