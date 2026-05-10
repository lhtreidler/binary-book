import { Autocomplete, useAutocomplete } from "@/components/autocomplete";
import { RankingModal } from "@/components/ranking-modal/ranking-modal";
import { Box } from "@/components/ui/box";
import { BookSearchItem } from "@/lib/api";
import { useSearchBooks } from "@/lib/api/hooks/useBooks";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { ScrollView } from "react-native";

export default function Add() {
  const [selectedBook, setSelectedBook] = useState<BookSearchItem | null>(null);
  const [query, setQuery] = useState("");

  const queryClient = useQueryClient();
  const { isLoading, data } = useSearchBooks({ query });
  const router = useRouter();

  const options = useMemo(() => {
    if (!data) return [];
    return data.items.map(({ key, title, authors, isRanked }) => {
      const authorStr = authors.length ? authors.join(", ") : "Unknown Author";
      const label = `${title} by ${authorStr}`;
      return {
        key,
        label,
        hideAction: isRanked,
      };
    });
  }, [data]);

  const { reset, ...props } = useAutocomplete({
    onChange: (q: string) => setQuery(q),
    options,
    isLoading,
  });

  const onSelectBook = (gId: string) => {
    const book = data?.items.find(({ key }) => key === gId);
    if (book) setSelectedBook(book);
  };

  const onCloseModal = (bookId?: string) => {
    if (bookId) {
      queryClient.invalidateQueries({ queryKey: ["books", query] });
      queryClient.invalidateQueries({ queryKey: ["books", "list"] });
      reset();
      router.push(`/book/${bookId}`);
    }
    setSelectedBook(null);
  };

  return (
    <Box>
      <ScrollView>
        <Autocomplete
          {...props}
          rightActions={[{ icon: "add", handler: onSelectBook }]}
        />
        <RankingModal
          book={selectedBook}
          isOpen={!!selectedBook}
          onClose={onCloseModal}
        />
      </ScrollView>
    </Box>
  );
}
