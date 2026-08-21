/**
 * API Response Types
 */

export type Paginated<T extends object> = T & { nextPage: number | null };

export interface User {
  email: string;
  firstName: string | null;
  lastName: string | null;
  username: string | null;
  profileImg: string | null;
}

export interface AuthResponse {
  token: string;
}

export interface UpdateUserResponse {
  success: boolean;
}

export type MeResponse = User;

export interface CheckUsernameResponse {
  isTaken: boolean;
}

export type UserSearchItem = {
  username: string;
  firstName: string | null;
  lastName: string | null;
  profileImg: string | null;
  id: string;
  isFollowedByYou: boolean;
  isFollowingYou: boolean;
};

export type SearchByUsernameResponse = Paginated<{ users: UserSearchItem[] }>;

type ProfileData = {
  firstName: string | null;
  lastName: string | null;
  username: string | null;
  profileImg: string | null;
  createdAt: Date;
  followerCount: number;
  followingCount: number;
};

export type UseGetMyProfileResponse = ProfileData;

export type UseGetProfileResponse = ProfileData & {
  isUserFollowing: boolean;
  isUserFollowed: boolean;
};

export interface Book {
  id: string;
}

export interface BookSearchItem {
  apiId: string;
  id: string | null;
  title: string;
  authors: string[];
  thumbnail: string;
  isRanked: boolean;
  bookmarkId: string | null;
}

export type BookSearchResponse = Paginated<{ items: BookSearchItem[] }>;

export interface BookListItem {
  bookId: string;
  title: string;
  authors: string[];
  score: number;
}

export type BookListResponse = Paginated<{ list: BookListItem[] }>;

export interface BookDetailResponse {
  apiId: string;
  title: string | null;
  authors: string[];
  thumbnail: string | null;
  description: string | null;
  publishedDate: string | null;
  pageCount: number | null;
  userScore: number | null;
  bookmarkId: string | null;
  tags: string[];
}

export interface Ranking {
  id: string;
  userId: string;
  bookId: string;
  rawScore: number;
  // Add other ranking fields as needed
}

export interface RankingSession {
  id: string;
  userId: string;
  bookId: string;
  level: number;
  low: number;
  high: number;
  // Add other session fields as needed
}

export interface RankingBookInfo {
  title: string | null;
  authors: string[];
}

export type FinishedRankingResponse = { score: number; bookId: string };
type RankingResponse = { compareBook: RankingBookInfo };

export type StartRankingResponse =
  | ({
      sessionId: string;
    } & RankingResponse)
  | FinishedRankingResponse;

export type ContinueRankingResponse = RankingResponse | FinishedRankingResponse;

export type QuitRankingResponse = void;

export interface ApiError {
  error: string;
  message?: string;
}

export type FollowListUser = {
  id: string;
  username: string | null;
  profileImg: string | null;
  firstName: string | null;
  lastName: string | null;
  /** Whether the current logged-in user follows this person */
  isFollowedByYou: boolean;
  /** Whether this person follows the current logged-in user */
  isFollowingYou: boolean;
};

export type FollowListResponse = Paginated<{ result: FollowListUser[] }>;

export type RecommendedUser = Omit<FollowListUser, "isFollowedByYou" | "isFollowingYou"> & {
  mutualFollowers: number;
};

export type FriendRecommendationsResponse = Paginated<{ result: RecommendedUser[] }>;
