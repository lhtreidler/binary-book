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
}

export interface BookSearchResponse {
  items: BookSearchItem[];
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

export interface StartRankingResponse {
  sessionId: string;
  bookId: string;
  rankingToCompare: Ranking;
  // Add other fields as needed
}

export interface ContinueRankingResponse {
  score?: number;
  rankingToCompare?: Ranking;
  // Add other fields as needed
}

export interface ApiError {
  error: string;
  message?: string;
}
