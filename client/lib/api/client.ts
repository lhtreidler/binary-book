/**
 * API Client with Authentication
 * Automatically attaches session token to all requests
 */

import axios, { AxiosInstance } from "axios";
import {
  getStorageItemAsync,
  setStorageItemAsync,
} from "@/session/useStorageState";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";

let apiClient: AxiosInstance | null = null;

/**
 * Initialize the API client with auth interceptor
 */
export async function initializeApiClient(): Promise<AxiosInstance> {
  if (apiClient) {
    return apiClient;
  }

  apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Request interceptor: Add auth token to every request
  apiClient.interceptors.request.use(
    async (config) => {
      try {
        const token = await getStorageItemAsync("session");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        console.error("Error retrieving token:", error);
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    },
  );

  // Response interceptor: Handle auth errors
  apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error.response?.status === 401) {
        // Clear session on auth failure
        try {
          await setStorageItemAsync("session", null);
        } catch (err) {
          console.error("Error clearing session:", err);
        }
      }
      return Promise.reject(error);
    },
  );

  return apiClient;
}

/**
 * Get the API client instance
 */
export async function getApiClient(): Promise<AxiosInstance> {
  if (!apiClient) {
    return initializeApiClient();
  }
  return apiClient;
}

/**
 * Reset the API client (useful for testing)
 */
export function resetApiClient(): void {
  apiClient = null;
}
