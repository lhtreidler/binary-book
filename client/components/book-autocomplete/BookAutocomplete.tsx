import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { Autocomplete, useAutocomplete } from "@/components/autocomplete";
import { RankingModal } from "@/components/ranking-modal/RankingModal";
import { BookSearchItem } from "@/lib/api";
import { useSearchBooks } from "@/lib/api/hooks/useBooks";
import { Box } from "../ui/box";

export const BookAutocomplete = ({
  isSticky = false,
}: {
  isSticky?: boolean;
}) => {
  const [query, setQuery] = useState("");
  const [selectedBook, setSelectedBook] = useState<BookSearchItem | null>(null);

  const queryClient = useQueryClient();
  const router = useRouter();
  const { isLoading, data } = useSearchBooks({ query });

  const options = useMemo(() => {
    if (!data) return [];
    return data.items.map(({ key, title, authors, isRanked, thumbnail }) => {
      const authorStr = authors.length ? authors.join(", ") : "Unknown Author";
      const label = `${title} by ${authorStr}`;
      return { key, label, hideAction: isRanked, thumbnail };
    });
  }, [data]);

  const { reset, ...autocompleteProps } = useAutocomplete({
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
      queryClient.invalidateQueries({ queryKey: ["books", "list"] });
      reset();
      router.push(`/book/${bookId}`);
    }
    setSelectedBook(null);
  };

  const containerClassName = `w-full bg-transparent${isSticky ? " sticky" : ""}`;

  return (
    <Box className={containerClassName}>
      <Autocomplete
        {...autocompleteProps}
        fieldProps={{
          ...autocompleteProps.fieldProps,
          placeholder: "Search for books...",
        }}
        overlay
        rightActions={[{ icon: "add", handler: onSelectBook }]}
      />
      <RankingModal
        book={selectedBook}
        isOpen={!!selectedBook}
        onClose={onCloseModal}
      />
    </Box>
  );
};
