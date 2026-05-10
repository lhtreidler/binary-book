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
import {
  AuthResponse,
  MeResponse,
  User,
  ApiError,
  CheckUsernameResponse,
  UpdateUserResponse,
} from "../types";
import { useSession } from "@/session/ctx";
import { AxiosError } from "axios";

export interface LoginInput {
  email: string;
  password: string;
}

export interface SignupInput {
  email: string;
  password: string;
}

export interface CheckEmailInput {
  email: string;
}

export interface CheckUsernameInput {
  username: string;
}

export interface UpdateUserInput {
  firstName?: string;
  lastName?: string;
  username?: string;
}

/**
 * Fetch current user details
 */
export function useMe(): UseQueryResult<User, ApiError> {
  const { signOut } = useSession();

  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      try {
        const client = await getApiClient();
        const { data } = await client.get<MeResponse>("/auth/me");
        return data || {};
      } catch (err) {
        const error = err as AxiosError;

        if (error.status === 401) {
          signOut();
        }

        return {} as User;
      }
    },
  });
}

export const useIsAccountSetUp = () => {
  const { data } = useMe();
  return !!(data && data.username && data.firstName && data.email);
};

/**
 * Check if username is taken
 */
export function useCheckUsername(
  username: string,
  enabled = true,
): UseQueryResult<CheckUsernameResponse, ApiError> {
  return useQuery({
    queryKey: ["auth", "check-username", username],
    queryFn: async () => {
      const client = await getApiClient();
      const { data } = await client.get<CheckUsernameResponse>(
        `/auth/check-username?username=${encodeURI(username)}`,
      );
      return data;
    },
    enabled: !!username && enabled,
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

/**
 * Signup mutation
 */
export function useUpdateUser(): UseMutationResult<
  UpdateUserResponse,
  ApiError,
  UpdateUserInput
> {
  return useMutation({
    mutationFn: async (input: UpdateUserInput) => {
      const client = await getApiClient();
      const { data } = await client.post<UpdateUserResponse>(
        "/auth/details",
        input,
      );
      return data;
    },
  });
}
