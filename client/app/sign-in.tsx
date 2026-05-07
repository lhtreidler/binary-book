import { router } from "expo-router";
import { View } from "react-native";
import { z } from "zod";

import { Form, FormData, FormProps, Question } from "@/components/form";
import { LoginInput, useLogin, useSignup } from "@/lib/api";
import { useState } from "react";
import { Text } from "@/components/ui/text";
import { Box } from "@/components/ui/box";

const questions: Question[] = [
  {
    key: "email",
    label: "Email",
    fieldProps: { placeholder: "Enter your email" },
  },
  {
    key: "password",
    label: "Password",
    fieldProps: { placeholder: "Enter your password", secureTextEntry: true },
  },
];

const zodSchema = z.object({
  email: z.email("Please enter a valid email address"),
  password: z
    .string("Enter a valid password")
    .min(8, "Password must be at least 8 characters long"),
});

export default function SignIn() {
  const loginMutation = useLogin();
  const signupMutation = useSignup();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (isLogIn: boolean, formData: FormData) => {
    setIsLoading(true);
    setError(null);
    const data = formData as unknown as LoginInput;
    try {
      if (isLogIn) {
        await loginMutation.mutateAsync(data);
      } else {
        await signupMutation.mutateAsync(data);
      }
    } catch (err) {
      const message =
        (err as any)?.response?.data?.message ||
        (isLogIn
          ? "Login failed. Please check your credentials and try again."
          : "Signup failed. Please try again later.");
      setError(message);
      setIsLoading(false);
    }
  };

  const formProps: FormProps = {
    questions,
    zodSchema,
    isLoading,
    onChange: console.log,
    button: [
      {
        label: "Log In",
        onPress: (formData) => onSubmit(true, formData),
      },
      {
        label: "Sign Up",
        action: "secondary",
        onPress: (formData) => onSubmit(false, formData),
      },
    ],
  };

  return (
    <View>
      <Form {...formProps} />
      {error ? (
        <Box style={{ padding: 10 }}>
          <Text
            className="text-error-400 px-3 py-1"
            style={{ textAlign: "center" }}
          >
            {error}
          </Text>
        </Box>
      ) : null}
    </View>
  );
}
