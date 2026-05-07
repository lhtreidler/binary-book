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
import { useSession } from "@/session/ctx";

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
  const { signIn } = useSession();

  return useMutation({
    mutationFn: async (input: LoginInput) => {
      const client = await getApiClient();
      const { data } = await client.post<AuthResponse>("/auth/login", input);
      return data;
    },
    onSuccess: async (data) => {
      // Update session context which will sync to storage
      signIn(data.token);
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
  const { signIn } = useSession();

  return useMutation({
    mutationFn: async (input: SignupInput) => {
      const client = await getApiClient();
      const { data } = await client.post<AuthResponse>("/auth/signup", input);
      return data;
    },
    onSuccess: async (data) => {
      // Update session context which will sync to storage
      signIn(data.token);
    },
  });
}
