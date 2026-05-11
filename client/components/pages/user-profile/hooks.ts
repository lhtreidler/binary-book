import { useFollow, useUnfollow } from "@/lib/api/hooks/useFollows";
import { useGetProfile } from "@/lib/api/hooks/useUsers";
import { useState } from "react";

export const useProfile = ({ userId }: { userId: string }) => {
  const { data, isLoading } = useGetProfile({ userId });
  const follow = useFollow(userId);
  const unfollow = useUnfollow(userId);
  const [followError, setFollowError] = useState("");

  const onFollow = async () => {
    try {
      await follow.mutateAsync();
    } catch {
      setFollowError("Failed to follow user. Please try again later.");
    }
  };

  const onUnfollow = async () => {
    try {
      await unfollow.mutateAsync();
    } catch {
      setFollowError("Failed to unfollow user. Please try again later.");
    }
  };

  return {
    data,
    isLoading,
    isFollowPending: follow.isPending || unfollow.isPending,
    followError,
    onFollow,
    onUnfollow,
  };
};
