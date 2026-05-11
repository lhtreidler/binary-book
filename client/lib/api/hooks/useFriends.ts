import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { ApiError, SearchByUsernameResponse } from "../types";
import { getApiClient } from "../client";

/**
 * Search for a user by username
 */
export function useSearchByUsername({
  username,
  enabled = true,
}: {
  username: string;
  enabled?: boolean;
}): UseQueryResult<SearchByUsernameResponse | null, ApiError> {
  return useQuery({
    queryKey: ["auth", "user", username],
    queryFn: async () => {
      const client = await getApiClient();
      const { data } = await client.get<SearchByUsernameResponse>(
        `/friends/search?q=${encodeURIComponent(username)}`,
      );
      return data;
    },
    enabled: !!username && enabled,
  });
}
