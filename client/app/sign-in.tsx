import { router } from "expo-router";
import { StyleSheet, Text, TextInput, View } from "react-native";

import { useSession } from "@/session/ctx";
import { Button, ButtonText } from "@/components/ui/button";
import { HStack } from "@/components/ui/hstack";
import { Input, InputField } from "@/components/ui/input";
import { Form, FormProps, Question } from "@/components/form";

const questions: Question[] = [
  {
    key: "usernameOrEmail",
    label: "Username or Email",
    fieldProps: { placeholder: "Enter your username or email" },
  },
  {
    key: "password",
    label: "Password",
    fieldProps: { placeholder: "Enter your password", secureTextEntry: true },
  },
];

export default function SignIn() {
  const { signIn } = useSession();

  const formProps: FormProps = {
    questions,
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
