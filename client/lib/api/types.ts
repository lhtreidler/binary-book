/**
 * API Response Types
 */

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

export type SearchByUsernameResponse = {
  users: {
    username: string;
    firstName: string | null;
    lastName: string | null;
    profileImg: string | null;
    id: string;
  }[];
};

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
  googleId: string;
  // Add other book fields as needed
}

export interface BookSearchItem {
  key: string;
  title: string;
  authors: string[];
  thumbnail: string;
  isRanked: boolean;
}

export interface BookSearchResponse {
  items: BookSearchItem[];
}

export interface BookListItem {
  bookId: string;
  title: string;
  authors: string[];
  score: number;
}

export interface BookListResponse {
  list: BookListItem[];
  nextPage: number | null;
}

export interface BookDetailResponse {
  googleId: string;
  title: string | null;
  authors: string[];
  thumbnail: string | null;
  description: string | null;
  publishedDate: string | null;
  pageCount: number | null;
  categories: string[];
  userScore: number | null;
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
};

export type FollowListResponse = {
  result: FollowListUser[];
  nextPage: number | null;
};
