import { useQuery, UseQueryResult } from "@tanstack/react-query";
import {
  ApiError,
  SearchByUsernameResponse,
  UseGetMyProfileResponse,
  UseGetProfileResponse,
} from "../types";
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
    queryKey: ["users", "search", username],
    queryFn: async () => {
      const client = await getApiClient();
      const { data } = await client.get<SearchByUsernameResponse>(
        `/users?q=${encodeURIComponent(username)}`,
      );
      return data;
    },
    enabled: !!username && enabled,
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
