import { Autocomplete, useAutocomplete } from "@/components/autocomplete";
import { AutocompleteOption } from "@/components/autocomplete/types";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { useSearchByUsername } from "@/lib/api/hooks/useUsers";
import { useMemo, useState } from "react";
import { View } from "react-native";

export default function Community() {
  const [usernameToSearch, setUsernameToSearch] = useState("");
  const { isLoading, data } = useSearchByUsername({
    username: usernameToSearch,
  });

  const options = useMemo(() => {
    if (!data) return [];

    return data.users.map(
      ({ id, username, profileImg, firstName, lastName }) =>
        ({
          id: username,
          label: username,
          avatarProps: {
            profileImg,
            firstName,
            lastName,
          },
          href: `/profile/${id}`,
        }) as AutocompleteOption,
    );
  }, [data]);

  const autocompleteProps = useAutocomplete({
    onChange: (q: string) => setUsernameToSearch(q),
    isLoading,
    options,
    fieldProps: {
      placeholder: "Search for friends...",
    },
  });

  return (
    <View>
      <VStack>
        <Text bold className="p4">
          Friends
        </Text>
        <Autocomplete {...autocompleteProps} />
      </VStack>
    </View>
  );
}
