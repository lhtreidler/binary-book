import { Autocomplete, useAutocomplete } from "@/components/autocomplete";
import { RankingModal } from "@/components/ranking-modal";
import { Box } from "@/components/ui/box";
import { BookSearchItem, BookSearchResponse } from "@/lib/api";
import { useSearchBooks } from "@/lib/api/hooks/useBooks";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { ScrollView } from "react-native";

export default function Add() {
  const [selectedBook, setSelectedBook] = useState<BookSearchItem | null>(null);
  const [query, setQuery] = useState("");
  const [data, setData] = useState<BookSearchResponse | undefined>(undefined);

  const queryClient = useQueryClient();
  const { isLoading, data: queryData } = useSearchBooks({ query });

  useEffect(() => {
    if (queryData !== undefined) {
      setData(queryData);
    }
  }, [queryData]);

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

  const props = useAutocomplete({
    onChange: (q: string) => setQuery(q),
    options,
    isLoading,
  });

  const onSelectBook = (gId: string) => {
    const book = data?.items.find(({ key }) => key === gId);
    if (book) setSelectedBook(book);
  };

  const onCloseModal = () => {
    queryClient.invalidateQueries({ queryKey: ["books", query] });
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
