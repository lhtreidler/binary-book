import { Autocomplete, useAutocomplete } from "@/components/autocomplete";
import { Box } from "@/components/ui/box";
import { Button, ButtonIcon } from "@/components/ui/button";
import { Center } from "@/components/ui/center";
import { HStack } from "@/components/ui/hstack";
import { AddIcon } from "@/components/ui/icon";
import { searchBooks } from "@/lib/api";

export default function Add() {
  const requestFunc = async (query: string) => {
    try {
      const response = await searchBooks(query);
      return response.items.map(({ key, title, authors }) => {
        const authorStr = authors.length
          ? authors.join(", ")
          : "Unknown Author";
        const label = `${title} by ${authorStr}`;
        return {
          key,
          label,
        };
      });
    } catch {
      return [];
    }
  };

  const RightAction = () => {
    return (
      <HStack className="ml-3">
        <Button size="sm" className="rounded-full py-1" variant="outline">
          <ButtonIcon className="py-2" size="sm" as={AddIcon} />
        </Button>
      </HStack>
    );
  };

  const props = useAutocomplete({
    requestFunc,
    onSelect: console.log,
  });

  return (
    <Box>
      <Autocomplete {...props} rightAction={<RightAction />} />
    </Box>
  );
}
