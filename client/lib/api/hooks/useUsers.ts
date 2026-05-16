import {
  useInfiniteQuery,
  UseInfiniteQueryResult,
  InfiniteData,
  useQuery,
  UseQueryResult,
} from "@tanstack/react-query";
import {
  ApiError,
  SearchByUsernameResponse,
  UseGetMyProfileResponse,
  UseGetProfileResponse,
} from "../types";
import { getApiClient } from "../client";

export const searchUsers = async (username: string, page = 1) => {
  const client = await getApiClient();
  const { data } = await client.get<SearchByUsernameResponse>("/users", {
    params: { q: username, page },
  });
  return data;
};

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
    queryKey: ["users", "search", username],
    queryFn: () => searchUsers(username),
    enabled: !!username && enabled,
  });
}

export function useSearchUsersInfinite({
  username,
}: {
  username: string;
}): UseInfiniteQueryResult<InfiniteData<SearchByUsernameResponse>, ApiError> {
  return useInfiniteQuery({
    queryKey: ["users", "search", "infinite", username],
    queryFn: ({ pageParam }) => searchUsers(username, pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    enabled: !!username,
  });
}

/**
 * Get user profile
 */
export function useGetProfile({
  userId,
}: {
  userId?: string;
}): UseQueryResult<UseGetProfileResponse | null, ApiError> {
  return useQuery({
    queryKey: ["users", "profile", userId],
    queryFn: async () => {
      const client = await getApiClient();
      const { data } = await client.get<UseGetProfileResponse>(
        `/users/${userId}`,
      );
      return data;
    },
    enabled: !!userId,
  });
}

/**
 * Get my profile
 */
export function useGetMyProfile(): UseQueryResult<
  UseGetMyProfileResponse | null,
  ApiError
> {
  return useQuery({
    queryKey: ["users", "me"],
    queryFn: async () => {
      const client = await getApiClient();
      const { data } = await client.get<UseGetMyProfileResponse>(`/users/me`);
      return data;
    },
  });
}
