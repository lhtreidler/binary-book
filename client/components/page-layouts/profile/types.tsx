import {
  UseGetMyProfileResponse,
  UseGetProfileResponse,
} from "@/lib/api/types";

export type ProfileProps =
  | {
      isSelf: true;
      data?: UseGetMyProfileResponse | null;
      isLoading: boolean;
    }
  | {
      isSelf: false;
      userId: string;
      data?: UseGetProfileResponse | null;
      onFollow: () => void;
      onUnfollow: () => void;
      followError: string;
      isFollowPending: boolean;
      isLoading: boolean;
    };
