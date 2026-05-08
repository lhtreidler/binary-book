/**
 * Book Search Query Hooks
 */

import { getApiClient } from "../client";
import { BookSearchResponse } from "../types";

export const searchBooks = async (query: string) => {
  const client = await getApiClient();
  const { data } = await client.get("/books", {
    params: { q: query },
  });

  return data as BookSearchResponse;
};
