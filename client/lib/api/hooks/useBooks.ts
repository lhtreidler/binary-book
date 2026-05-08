/**
 * Book Search Query Hooks
 */

import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { getApiClient } from "../client";
import { ApiError, BookSearchResponse } from "../types";

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
  });
}
