import { View } from "react-native";
import { z } from "zod";
import { useState } from "react";

import { Form, FormData, FormProps, Question } from "@/components/form";
import { LoginInput, useLogin, useSignup } from "@/lib/api";
import { Text } from "@/components/ui/text";
import { Box } from "@/components/ui/box";
import { Center } from "@/components/ui/center";
import { AxiosError } from "axios";

const questions: Question[] = [
  {
    key: "email",
    label: "Email",
    fieldProps: { placeholder: "Enter your email" },
  },
  {
    key: "password",
    label: "Password",
    type: "password",
    fieldProps: { placeholder: "Choose a password" },
  },
];

const passwordSchema = z.string("Enter a valid password");
const newPasswordSchema = passwordSchema
  .min(8, "Password must be at least 8 characters long")
  .regex(/\d/, "Password must include at least one number")
  .regex(/[a-z]/, "Password must include at least one lowercase letter")
  .regex(/[A-Z]/, "Password must include at least one uppercase letter");

export function SignInForm({ type }: { type: "login" | "signup" }) {
  const loginMutation = useLogin();
  const signupMutation = useSignup();
  const [error, setError] = useState<string | null>(null);

  const isLogIn = type === "login";

  const zodSchema = z.object({
    email: z.email("Please enter a valid email address"),
    password: isLogIn ? passwordSchema : newPasswordSchema,
  });

  const onSubmit = async (formData: FormData) => {
    setError(null);
    const data = formData as unknown as LoginInput;
    try {
      if (isLogIn) {
        await loginMutation.mutateAsync(data);
      } else {
        await signupMutation.mutateAsync(data);
      }
    } catch (error) {
      const err = error as AxiosError;

      const message =
        err.message ||
        (isLogIn
          ? "Login failed. Please check your credentials and try again."
          : "Signup failed. Please try again later.");
      setError(message);
    }
  };

  const isLoading = loginMutation.isPending || signupMutation.isPending;

  const formProps: FormProps = {
    questions,
    zodSchema,
    isLoading,
    button: [
      {
        label: isLogIn ? "Log In" : "Create Account",
        onPress: onSubmit,
      },
    ],
  };

  return (
    <View>
      <Center className="h-3/4 px-2">
        <Text className="align-middle text-2xl">Welcome to Book Tracker</Text>
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
      </Center>
    </View>
  );
}
