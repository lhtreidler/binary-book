import { useFollow, useUnfollow } from "@/lib/api/hooks/useFollows";
import { useGetProfile } from "@/lib/api/hooks/useUsers";
import { QueryClient } from "@tanstack/react-query";
import { useState } from "react";

export const useProfile = ({ userId }: { userId: string }) => {
  const { data, isLoading } = useGetProfile({ userId });
  const follow = useFollow(userId);
  const unfollow = useUnfollow(userId);
  const [followError, setFollowError] = useState("");

  const queryClient = new QueryClient();

  const invalidateQueries = () => {
    queryClient.invalidateQueries({ queryKey: ["users", "me"] });
    queryClient.invalidateQueries({ queryKey: ["users", userId] });
    queryClient.invalidateQueries({ queryKey: ["follow"] });
  };

  const onFollow = async () => {
    try {
      await follow.mutateAsync();

      invalidateQueries();
    } catch {
      setFollowError("Failed to follow user. Please try again later.");
    }
  };

  const onUnfollow = async () => {
    try {
      await unfollow.mutateAsync();

      invalidateQueries();
    } catch {
      setFollowError("Failed to follow user. Please try again later.");
    }
  };

  return {
    data: data,
    isLoading: isLoading,
    isFollowPending: follow.isPending || unfollow.isPending,
    followError,
    onFollow,
    onUnfollow,
  };
};
