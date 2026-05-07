/**
 * Authentication Query Hooks
 */

import {
  useMutation,
  useQuery,
  UseQueryResult,
  UseMutationResult,
} from "@tanstack/react-query";
import { getApiClient } from "../client";
import { AuthResponse, MeResponse, User, ApiError } from "../types";
import { setStorageItemAsync } from "@/session/useStorageState";

export interface LoginInput {
  email: string;
  password: string;
}

export interface SignupInput {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  username?: string;
}

/**
 * Fetch current user details
 */
export function useMe(): UseQueryResult<User, ApiError> {
  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      const client = await getApiClient();
      const { data } = await client.get<MeResponse>("/auth/me");
      return data.user;
    },
  });
}

/**
 * Login mutation
 */
export function useLogin(): UseMutationResult<
  AuthResponse,
  ApiError,
  LoginInput
> {
  return useMutation({
    mutationFn: async (input: LoginInput) => {
      const client = await getApiClient();
      const { data } = await client.post<AuthResponse>("/auth/login", input);
      return data;
    },
    onSuccess: async (data) => {
      // The session provider will handle storing the token
      await setStorageItemAsync("session", data.token);
    },
  });
}

/**
 * Signup mutation
 */
export function useSignup(): UseMutationResult<
  AuthResponse,
  ApiError,
  SignupInput
> {
  return useMutation({
    mutationFn: async (input: SignupInput) => {
      const client = await getApiClient();
      const { data } = await client.post<AuthResponse>("/auth/signup", input);
      return data;
    },
    onSuccess: async (data) => {
      console.log(data);
      await setStorageItemAsync("session", data.token);
    },
  });
}
