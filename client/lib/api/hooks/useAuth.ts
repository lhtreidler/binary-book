/**
 * Authentication Query Hooks
 */

import {
  useMutation,
  useQuery,
  useQueryClient,
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
  profileImg?: string | null;
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

        if (!data.username) {
          signOut();
        }

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

export function useIsLoggedIn() {
  const { data, isLoading } = useMe();
  const value = useSession();

  return { isLoading, isLoggedIn: !!value?.session && !!data?.username };
}

export const useIsAccountSetUp = () => {
  const { data, isLoading } = useMe();
  return {
    isAccountSetUp: !!(data && data.username && data.firstName && data.email),
    isLoading,
  };
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
        `/auth/check-username`,
        { params: { username } },
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
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: LoginInput) => {
      const client = await getApiClient();
      const { data } = await client.post<AuthResponse>("/auth/login", input);
      return data;
    },
    onSuccess: async (data) => {
      signIn(data.token);
      await queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
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
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: SignupInput) => {
      const client = await getApiClient();
      const { data } = await client.post<AuthResponse>("/auth/signup", input);
      return data;
    },
    onSuccess: async (data) => {
      signIn(data.token);
      await queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
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

export function useUploadProfileImage(): UseMutationResult<
  { url: string },
  ApiError,
  { localUri: string; mimeType?: string }
> {
  return useMutation({
    mutationFn: async ({ localUri, mimeType }) => {
      const { uploadToCloudinary } = await import("@/lib/cloudinary");
      const url = await uploadToCloudinary(localUri, mimeType);

      const client = await getApiClient();
      await client.post<UpdateUserResponse>("/auth/details", {
        profileImg: url,
      });

      return { url };
    },
  });
}
