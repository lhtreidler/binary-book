import {
  useQueryClient,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { getApiClient } from "../client";
import { ApiError } from "../types";

export const createBookmark = async (apiId: string) => {
  const client = await getApiClient();
  const { data } = await client.post("/bookmarks", { apiId });
  return data;
};

export function useCreateBookmark(): UseMutationResult<
  { id: string },
  ApiError,
  string
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createBookmark,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["books"] });
    },
  });
}

export const deleteBookmark = async (bookmarkId: string) => {
  const client = await getApiClient();
  const { data } = await client.delete(`/bookmarks/${bookmarkId}`);
  return data;
};

export function useDeleteBookmark(): UseMutationResult<
  { success: boolean },
  ApiError,
  string
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteBookmark,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["books"] });
    },
  });
}
