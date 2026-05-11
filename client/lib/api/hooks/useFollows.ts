import {
  InfiniteData,
  useInfiniteQuery,
  UseInfiniteQueryResult,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { getApiClient } from "../client";
import { ApiError, FollowListResponse, FollowListUser } from "../types";

type RawFollowUser = {
  username: string | null;
  profileImg: string | null;
  firstName: string | null;
  lastName: string | null;
};

type RawFollowListResponse = {
  result: {
    fromId: string;
    toId: string;
    from?: RawFollowUser;
    to?: RawFollowUser;
  }[];
  nextPage: number | null;
};

export function useFollowList({
  type,
  userId,
  enabled = true,
}: {
  type: "followers" | "following";
  userId?: string;
  enabled?: boolean;
}): UseInfiniteQueryResult<InfiniteData<FollowListResponse>, ApiError> {
  return useInfiniteQuery({
    queryKey: ["follow", type, userId ?? "me"],
    queryFn: async ({ pageParam }) => {
      const client = await getApiClient();
      const url = userId ? `/follow/${type}/${userId}` : `/follow/${type}`;
      const { data } = await client.get<RawFollowListResponse>(url, {
        params: { page: pageParam },
      });
      const isFollowers = type === "followers";
      return {
        result: data.result.map((item) => ({
          id: isFollowers ? item.fromId : item.toId,
          ...(isFollowers ? item.from : item.to),
        })) as FollowListUser[],
        nextPage: data.nextPage,
      };
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    enabled,
  });
}

export function useFollow(userId: string) {
  const queryClient = useQueryClient();
  return useMutation<void, ApiError, void>({
    mutationFn: async () => {
      const client = await getApiClient();
      await client.post(`/follow/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users", userId] });
      queryClient.invalidateQueries({ queryKey: ["follow"] });
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
      queryClient.invalidateQueries({ queryKey: ["follow"] });
    },
  });
}
