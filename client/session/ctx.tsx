import { use, createContext, type PropsWithChildren } from "react";

import { setStorageItemAsync, useStorageState } from "./useStorageState";

const AuthContext = createContext<{
  signIn: (token: string) => void;
  signOut: () => void;
  session?: string | null;
  isLoading?: boolean;
}>({
  signIn: () => {},
  signOut: () => setStorageItemAsync("session", null),
  session: null,
  isLoading: true,
});

export function useIsLoggedIn() {
  const value = use(AuthContext);
  if (!value) {
    throw new Error("useIsLoggedIn must be wrapped in a <SessionProvider />");
  }

  return !!value.session;
}

// Use this hook to access the user info.
export function useSession() {
  const value = use(AuthContext);
  if (!value) {
    throw new Error("useSession must be wrapped in a <SessionProvider />");
  }

  return value;
}

export function SessionProvider({ children }: PropsWithChildren) {
  const [[isLoading, session], setSession] = useStorageState("session");

  return (
    <AuthContext.Provider
      value={{
        signIn: (token: string) => {
          setSession(token);
        },
        signOut: () => {
          setSession(null);
        },
        session,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
