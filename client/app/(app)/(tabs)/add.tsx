import { Autocomplete, useAutocomplete } from "@/components/autocomplete";
import { Box } from "@/components/ui/box";
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
  const props = useAutocomplete(requestFunc);

  return (
    <Box>
      <Autocomplete
        {...props}
        rightActions={[{ icon: "add", handler: console.log }]}
      />
    </Box>
  );
}
