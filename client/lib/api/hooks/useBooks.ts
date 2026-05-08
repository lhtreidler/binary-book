/**
 * Book Search Query Hooks
 */

import {
  useInfiniteQuery,
  UseInfiniteQueryResult,
  InfiniteData,
  useQuery,
  UseQueryResult,
  keepPreviousData,
} from "@tanstack/react-query";
import { getApiClient } from "../client";
import { ApiError, BookListResponse, BookSearchResponse } from "../types";

export const searchBooks = async (query: string) => {
  const client = await getApiClient();
  const { data } = await client.get<BookSearchResponse>("/books", {
    params: { q: query },
  });

  return data;
};

export function useSearchBooks({
  query,
}: {
  query: string;
}): UseQueryResult<BookSearchResponse, ApiError> {
  return useQuery({
    queryKey: ["books", query],
    queryFn: () => searchBooks(query),
    enabled: !!query,
    placeholderData: keepPreviousData,
  });
}

export const fetchBookList = async (page: number) => {
  const client = await getApiClient();
  const { data } = await client.get<BookListResponse>("/books/list", {
    params: { page },
  });

  return data;
};

export function useBookList(): UseInfiniteQueryResult<
  InfiniteData<BookListResponse>,
  ApiError
> {
  return useInfiniteQuery({
    queryKey: ["books", "list"],
    queryFn: ({ pageParam }) => fetchBookList(pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });
}
