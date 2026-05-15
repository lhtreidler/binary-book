import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Href, useRouter } from "expo-router";
import { useAutocomplete } from "@/components/autocomplete";
import { BookSearchItem, BookSearchResponse } from "@/lib/api";
import {
  useSearchBooks,
  useSearchBooksInfinite,
  useCreateBookmark,
  useDeleteBookmark,
} from "@/lib/api/hooks";
import { buildBookOptions } from "./utils";

const useBookActionHandlers = (getItems: () => BookSearchItem[]) => {
  const [selectedBook, setSelectedBook] = useState<BookSearchItem | null>(null);
  const [bookmarkOverrides, setBookmarkOverrides] = useState<Map<string, string | null>>(new Map());
  const [rankedOverrides, setRankedOverrides] = useState<Set<string>>(new Set());
  const { mutate: createBookmark } = useCreateBookmark();
  const { mutate: deleteBookmark } = useDeleteBookmark();

  const onSelectBook = (apiId: string) => {
    const book = getItems().find((b) => b.apiId === apiId);
    if (book) setSelectedBook(book);
  };

  const onBookmarkBook = (apiId: string) => {
    const book = getItems().find((b) => b.apiId === apiId);
    if (!book) return;

    const effectiveBookmarkId = bookmarkOverrides.has(apiId)
      ? bookmarkOverrides.get(apiId)
      : book.bookmarkId;

    if (effectiveBookmarkId) {
      deleteBookmark(effectiveBookmarkId, {
        onSuccess: () =>
          setBookmarkOverrides((prev) => new Map(prev).set(apiId, null)),
      });
    } else {
      createBookmark(apiId, {
        onSuccess: (data) =>
          setBookmarkOverrides((prev) => new Map(prev).set(apiId, data.id)),
      });
    }
  };

  const markBookRanked = (apiId: string) =>
    setRankedOverrides((prev) => new Set(prev).add(apiId));

  return { selectedBook, setSelectedBook, onSelectBook, onBookmarkBook, bookmarkOverrides, rankedOverrides, markBookRanked };
};

export const useBookAutocomplete = () => {
  const [query, setQuery] = useState("");
  const queryClient = useQueryClient();
  const router = useRouter();
  const { isLoading, data } = useSearchBooks({ query });

  const { selectedBook, setSelectedBook, onSelectBook, onBookmarkBook, bookmarkOverrides, rankedOverrides, markBookRanked } =
    useBookActionHandlers(() => data?.items ?? []);

  const options = useMemo(
    () =>
      buildBookOptions(data?.items ?? [], {
        onSelect: onSelectBook,
        onBookmark: onBookmarkBook,
      }, bookmarkOverrides, rankedOverrides),
    [data?.items, onBookmarkBook, onSelectBook, bookmarkOverrides, rankedOverrides],
  );

  const { reset, ...autocompleteProps } = useAutocomplete({
    onChange: (q: string) => setQuery(q),
    options,
    isLoading,
    fieldProps: {
      placeholder: "Search for books by title, author, or keyword",
    },
    initialOptionCount: 3,
  });

  const onViewAll = () => {
    if (query)
      router.push(`/search/books?q=${encodeURIComponent(query)}` as Href);
  };

  const onCloseModal = (bookId?: string) => {
    if (bookId) {
      if (selectedBook) markBookRanked(selectedBook.apiId);
      queryClient.invalidateQueries({ queryKey: ["books", "list"] });
      queryClient.invalidateQueries({ queryKey: ["books", "detail", bookId] });
      reset();
      router.push(`/book/${bookId}`);
    }
    setSelectedBook(null);
  };

  return {
    onCloseModal,
    autocompleteProps: { ...autocompleteProps, onViewAll },
    modalProps: {
      book: selectedBook,
      isOpen: !!selectedBook,
      onClose: onCloseModal,
    },
  };
};

export const useBookSearchPage = (query: string) => {
  const queryClient = useQueryClient();
  const router = useRouter();

  const infiniteQuery = useSearchBooksInfinite({ query });
  const { data } = infiniteQuery;

  const allItems = useMemo(
    () => data?.pages.flatMap((p: BookSearchResponse) => p.items) ?? [],
    [data],
  );

  const { selectedBook, setSelectedBook, onSelectBook, onBookmarkBook, bookmarkOverrides, rankedOverrides, markBookRanked } =
    useBookActionHandlers(() => allItems);

  const options = useMemo(
    () =>
      buildBookOptions(allItems, {
        onSelect: onSelectBook,
        onBookmark: onBookmarkBook,
      }, bookmarkOverrides, rankedOverrides),
    [allItems, onBookmarkBook, onSelectBook, bookmarkOverrides, rankedOverrides],
  );

  const onCloseModal = (bookId?: string) => {
    if (bookId) {
      if (selectedBook) markBookRanked(selectedBook.apiId);
      queryClient.invalidateQueries({ queryKey: ["books", "list"] });
      queryClient.invalidateQueries({ queryKey: ["books", "detail", bookId] });
      router.push(`/book/${bookId}`);
    }
    setSelectedBook(null);
  };

  return {
    infiniteQuery,
    options,
    modalProps: {
      book: selectedBook,
      isOpen: !!selectedBook,
      onClose: onCloseModal,
    },
  };
};
