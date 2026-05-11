export type FollowListProps = {
  type: "followers" | "following";
  userId?: string;
  isSelf: boolean;
};
