/**
 * Central export for all API hooks
 * Import from here for convenience
 */

export { useMe, useLogin, useSignup, useIsAccountSetUp } from "./useAuth";
export type { LoginInput, SignupInput } from "./useAuth";

export { useStartRanking, useContinueRanking } from "./useRanking";
export type { StartRankingInput, ContinueRankingInput } from "./useRanking";

export {
  searchBooks,
  useSearchBooks,
  useSearchBooksInfinite,
  useBookList,
  useBookDetail,
} from "./useBooks";

export {
  useSearchByUsername,
  useSearchUsersInfinite,
  useGetProfile,
  useGetMyProfile,
} from "./useUsers";

export * from "./useBookmarks";
export { useFollowList, useFollow, useUnfollow, useFollowRecommendations } from "./useFollows";
