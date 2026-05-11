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
      data?: UseGetProfileResponse | null;
      onFollow: () => void;
      onUnfollow: () => void;
      followError: string;
      isFollowPending: boolean;
      isLoading: boolean;
    };
