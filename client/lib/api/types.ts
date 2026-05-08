/**
 * API Response Types
 */

export interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  username: string | null;
}

export interface AuthResponse {
  token: string;
}

export interface MeResponse {
  user: User;
}

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
  title: string;
  authors: string[];
  score: number;
}

export interface BookListResponse {
  list: BookListItem[];
  nextPage: number | null;
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

export type FinishedRankingResponse = { score: number };

export type StartRankingResponse =
  | {
      sessionId: string;
      compareBook: RankingBookInfo;
    }
  | FinishedRankingResponse;

export type ContinueRankingResponse =
  | {
      compareBook: RankingBookInfo;
    }
  | FinishedRankingResponse;

export type QuitRankingResponse = void;

export interface ApiError {
  error: string;
  message?: string;
}
