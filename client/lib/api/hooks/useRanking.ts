/**
 * Ranking Query Hooks
 */

import { useMutation, UseMutationResult } from "@tanstack/react-query";
import { getApiClient } from "../client";
import {
  StartRankingResponse,
  ContinueRankingResponse,
  ApiError,
  QuitRankingResponse,
} from "../types";

export interface StartRankingInput {
  rankingLevel: number;
  gId: string;
}

export type RankingSelection = "new" | "existing" | "skip";

export interface ContinueRankingInput {
  sessionId: string;
  seq: number;
  selection: RankingSelection;
}

export interface QuitRankingInput {
  sessionId: string;
}

/**
 * Start a ranking session
 */
export function useStartRanking(): UseMutationResult<
  StartRankingResponse,
  ApiError,
  StartRankingInput
> {
  return useMutation({
    mutationFn: async (input: StartRankingInput) => {
      const client = await getApiClient();
      const { data } = await client.post<StartRankingResponse>(
        "/ranking/start",
        input,
      );
      return data;
    },
  });
}

/**
 * Continue a ranking session
 */
export function useContinueRanking(): UseMutationResult<
  ContinueRankingResponse,
  ApiError,
  ContinueRankingInput
> {
  return useMutation({
    mutationFn: async (input: ContinueRankingInput) => {
      const client = await getApiClient();
      const { data } = await client.post<ContinueRankingResponse>(
        "/ranking/continue",
        input,
      );
      return data;
    },
  });
}

/**
 * Quit a ranking session
 */
export function useQuitRanking(): UseMutationResult<
  QuitRankingResponse,
  ApiError,
  QuitRankingInput
> {
  return useMutation({
    mutationFn: async (input: QuitRankingInput) => {
      const client = await getApiClient();
      const { data } = await client.post<QuitRankingResponse>(
        "/ranking/quit",
        input,
      );
      return data;
    },
  });
}
