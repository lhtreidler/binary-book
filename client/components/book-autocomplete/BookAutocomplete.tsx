import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { Autocomplete, useAutocomplete } from "@/components/autocomplete";
import { RankingModal } from "@/components/ranking-modal/RankingModal";
import { BookSearchItem } from "@/lib/api";
import {
  useSearchBooks,
  useCreateBookmark,
  useDeleteBookmark,
} from "@/lib/api/hooks";
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
  const { mutate: createBookmark } = useCreateBookmark();
  const { mutate: deleteBookmark } = useDeleteBookmark();

  const options = useMemo(() => {
    if (!data) return [];
    return data.items.map(
      ({ apiId, title, authors, isRanked, thumbnail, bookmarkId }) => {
        const authorStr = authors.length
          ? authors.join(", ")
          : "Unknown Author";
        const label = `${title} by ${authorStr}`;
        return {
          key: apiId,
          label,
          hideAction: isRanked,
          thumbnail,
          bookmarkId,
        };
      },
    );
  }, [data]);

  const { reset, ...autocompleteProps } = useAutocomplete({
    onChange: (q: string) => setQuery(q),
    options,
    isLoading,
  });

  const onSelectBook = (apiId: string) => {
    const book = data?.items.find((b) => b.apiId === apiId);
    if (book) setSelectedBook(book);
  };

  const onBookmarkBook = (apiId: string) => {
    const book = data?.items.find((b) => b.apiId === apiId);
    if (!book) return;

    if (book.bookmarkId) {
      deleteBookmark(book.bookmarkId, {
        onSuccess: () =>
          queryClient.invalidateQueries({ queryKey: ["books", query] }),
      });
    } else {
      createBookmark(apiId, {
        onSuccess: () =>
          queryClient.invalidateQueries({ queryKey: ["books", query] }),
      });
    }
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
        rightActions={[
          {
            faIcon: "bookmark-o",
            faIconActive: "bookmark",
            handler: onBookmarkBook,
          },
          { icon: "add", handler: onSelectBook },
        ]}
      />
      <RankingModal
        book={selectedBook}
        isOpen={!!selectedBook}
        onClose={onCloseModal}
      />
    </Box>
  );
};
