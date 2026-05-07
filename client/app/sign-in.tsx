import { router } from "expo-router";
import { View } from "react-native";
import { z } from "zod";

import { useSession } from "@/session/ctx";
import { Form, FormProps, Question } from "@/components/form";

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
  const { signIn } = useSession();

  const onSubmit = (formData: FormData, isSignUp: boolean) => {
    const { email, password } = formData as unknown as {
      email: string;
      password: string;
    };
    if (!email || !password) {
      return;
    }
  };

  const formProps: FormProps = {
    questions,
    zodSchema,
    onChange: console.log,
    button: [
      {
        label: "Log In",
        onPress: () => {
          signIn();
          // Navigate after signing in. You may want to tweak this to ensure sign-in is successful before navigating.
          router.replace("/");
        },
      },
      {
        label: "Sign Up",
        action: "secondary",
        onPress: console.log,
      },
    ],
  };

  return (
    <View>
      <Form {...formProps} />
    </View>
  );
}
