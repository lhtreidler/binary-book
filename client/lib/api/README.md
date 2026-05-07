# API Setup with TanStack Query

This folder contains a well-organized API client setup with TanStack Query (React Query) for managing server state and API calls.

## Structure

```
lib/api/
├── client.ts          # Axios instance with auth interceptors
├── types.ts           # TypeScript types for all API responses
├── index.ts           # Central export file
└── hooks/
    ├── useAuth.ts     # Authentication queries (login, signup, me)
    ├── useRanking.ts  # Ranking queries
    └── index.ts       # Central export for all hooks
```

## Features

- **Automatic Authentication**: Session token is automatically attached to all requests via interceptors
- **Type Safe**: Full TypeScript support with response types
- **Modular**: Easy to extend with new endpoints
- **Centralized**: Single source of truth for API configuration
- **Error Handling**: Built-in 401 handling that clears session on auth failure

## Usage

### Using a Query Hook

```tsx
import { useMe } from "@/lib/api";

export function UserProfile() {
  const { data: user, isLoading, error } = useMe();

  if (isLoading) return <Text>Loading...</Text>;
  if (error) return <Text>Error: {error.error}</Text>;

  return <Text>Hello, {user?.email}</Text>;
}
```

### Using a Mutation Hook

```tsx
import { useLogin } from "@/lib/api";
import { useRouter } from "expo-router";

export function LoginScreen() {
  const router = useRouter();
  const loginMutation = useLogin();

  const handleLogin = async () => {
    try {
      await loginMutation.mutateAsync({
        email: "user@example.com",
        password: "password123",
      });
      // Navigation happens automatically via guard in _layout.tsx
    } catch (error) {
      // Handle error
    }
  };

  return (
    <Button onPress={handleLogin} disabled={loginMutation.isPending}>
      Sign In
    </Button>
  );
}
```

## Adding New Endpoints

### 1. Add Types in `types.ts`

```tsx
export interface MyNewResponse {
  data: string;
  // ... other fields
}
```

### 2. Create Hooks in a New File

Create a new file like `hooks/useMyFeature.ts`:

```tsx
import { useQuery, useMutation } from "@tanstack/react-query";
import { getApiClient } from "../client";
import { MyNewResponse } from "../types";

export function useMyFeature() {
  return useQuery({
    queryKey: ["myFeature"],
    queryFn: async () => {
      const client = await getApiClient();
      const { data } = await client.get<MyNewResponse>("/my-endpoint");
      return data;
    },
  });
}
```

### 3. Export in `hooks/index.ts`

```tsx
export { useMyFeature } from "./useMyFeature";
```

## API Configuration

The API base URL is configured via the environment variable `EXPO_PUBLIC_API_URL`.
Defaults to `http://localhost:3000` if not set.

Set it in your `.env` file:

```
EXPO_PUBLIC_API_URL=http://your-api-url.com
```

## Authentication Flow

1. User logs in via `useLogin()` or `useSignup()`
2. Server returns a token in the response
3. `signIn(token)` is called automatically
4. Token is stored in secure storage
5. All future requests include the token via the Authorization header
6. If a 401 occurs, the session is cleared automatically

## Best Practices

- Use query keys that reflect the data hierarchy: `['feature', 'subfeature', id]`
- Handle loading and error states in your components
- Use mutations for POST/PUT/DELETE operations
- Use queries for GET operations
- Leverage TanStack Query's built-in caching and invalidation

## Dependencies

- `@tanstack/react-query` - Server state management
- `axios` - HTTP client
- `expo-secure-store` - Secure token storage (already installed)
