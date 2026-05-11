import { Autocomplete, useAutocomplete } from "@/components/autocomplete";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { useSearchByUsername } from "@/lib/api/hooks/useFriends";
import { useMemo, useState } from "react";
import { View } from "react-native";

export default function Community() {
  const [usernameToSearch, setUsernameToSearch] = useState("");
  const { isLoading, data } = useSearchByUsername({
    username: usernameToSearch,
  });

  const options = useMemo(() => {
    if (!data) return [];

    return data.users.map(({ username }) => ({
      key: username,
      label: username,
    }));
  }, [data]);

  const autocompleteProps = useAutocomplete({
    onChange: (q: string) => setUsernameToSearch(q),
    isLoading,
    options,
  });

  return (
    <View>
      <VStack className="p-4">
        <Text bold>Friends</Text>
        <Autocomplete
          fieldProps={{
            placeholder: "Search for friends...",
          }}
          {...autocompleteProps}
        />
      </VStack>
    </View>
  );
}
