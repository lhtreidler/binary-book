/\*\*

- Example: Login Component using TanStack Query
-
- This is an example of how to use the API hooks in your components.
- See lib/api/README.md for more documentation.
  \*/

import { useState } from "react";
import { View, Text, TextInput, Pressable, ActivityIndicator } from "react-native";
import { useLogin } from "@/lib/api";

export function LoginExample() {
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");

const loginMutation = useLogin();

const handleLogin = async () => {
try {
await loginMutation.mutateAsync({ email, password });
// Success! Navigation to (app) will happen automatically via the guard
} catch (error: any) {
alert(`Login failed: ${error?.response?.data?.error || "Unknown error"}`);
}
};

const isLoading = loginMutation.isPending;

return (
<View style={{ padding: 20, gap: 16 }}>
<TextInput
placeholder="Email"
value={email}
onChangeText={setEmail}
editable={!isLoading}
style={{
          borderWidth: 1,
          borderColor: "#ccc",
          padding: 12,
          borderRadius: 6,
        }}
/>

      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        editable={!isLoading}
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          padding: 12,
          borderRadius: 6,
        }}
      />

      <Pressable
        onPress={handleLogin}
        disabled={isLoading}
        style={{
          backgroundColor: isLoading ? "#ccc" : "#007AFF",
          padding: 12,
          borderRadius: 6,
          alignItems: "center",
        }}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={{ color: "#fff", fontWeight: "bold" }}>
            Sign In
          </Text>
        )}
      </Pressable>

      {loginMutation.isError && (
        <Text style={{ color: "red" }}>
          {loginMutation.error?.error || "An error occurred"}
        </Text>
      )}
    </View>

);
}
