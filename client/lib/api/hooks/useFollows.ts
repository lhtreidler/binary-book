import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getApiClient } from "../client";
import { ApiError } from "../types";

export function useFollow(userId: string) {
  const queryClient = useQueryClient();
  return useMutation<void, ApiError, void>({
    mutationFn: async () => {
      const client = await getApiClient();
      await client.post(`/follow/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users", userId] });
    },
  });
}

export function useUnfollow(userId: string) {
  const queryClient = useQueryClient();
  return useMutation<void, ApiError, void>({
    mutationFn: async () => {
      const client = await getApiClient();
      await client.delete(`/follow/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users", userId] });
    },
  });
}
