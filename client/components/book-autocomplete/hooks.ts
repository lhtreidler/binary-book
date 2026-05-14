import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useAutocomplete } from "@/components/autocomplete";
import { BookSearchItem } from "@/lib/api";
import {
  useSearchBooks,
  useCreateBookmark,
  useDeleteBookmark,
} from "@/lib/api/hooks";
import { AutocompleteOption } from "../autocomplete/types";

export const useBookAutocomplete = () => {
  const [query, setQuery] = useState("");
  const [selectedBook, setSelectedBook] = useState<BookSearchItem | null>(null);

  const queryClient = useQueryClient();
  const router = useRouter();
  const { isLoading, data } = useSearchBooks({ query });
  const { mutate: createBookmark } = useCreateBookmark();
  const { mutate: deleteBookmark } = useDeleteBookmark();

  const options: AutocompleteOption[] = useMemo(() => {
    if (!data) return [];

    const onSelectBook = (apiId: string) => {
      const book = data?.items.find((b) => b.apiId === apiId);
      if (book) setSelectedBook(book);
    };

    const onBookmarkBook = (apiId: string) => {
      console.log("bookmarking", apiId);
      const book = data?.items.find((b) => b.apiId === apiId);
      if (!book) return;

      if (book.bookmarkId) {
        console.log("delete");
        deleteBookmark(book.bookmarkId);
      } else {
        console.log("create");
        createBookmark(apiId);
      }
    };

    return data.items.map(
      ({ apiId, title, authors, isRanked, thumbnail, bookmarkId }) => {
        const authorStr = authors.length
          ? authors.join(", ")
          : "Unknown Author";
        const label = `${title} by ${authorStr}`;
        return {
          id: apiId,
          label,
          hideAction: isRanked,
          thumbnail,
          hasThumbnail: true,
          rightActions: [
            {
              icon: "bookmark",
              getIsActive: !!bookmarkId,
              handler: onBookmarkBook,
            },
            { icon: "add", handler: onSelectBook },
          ],
        };
      },
    );
  }, [createBookmark, data, deleteBookmark]);

  const { reset, ...autocompleteProps } = useAutocomplete({
    onChange: (q: string) => setQuery(q),
    options,
    isLoading,
    fieldProps: {
      placeholder: "Search for books by title, author, or keyword",
    },
  });

  const onCloseModal = (bookId?: string) => {
    if (bookId) {
      queryClient.invalidateQueries({ queryKey: ["books", "list"] });
      reset();
      router.push(`/book/${bookId}`);
    }
    setSelectedBook(null);
  };

  return {
    onCloseModal,
    autocompleteProps,
    modalProps: {
      book: selectedBook,
      isOpen: !!selectedBook,
      onClose: onCloseModal,
    },
  };
};
