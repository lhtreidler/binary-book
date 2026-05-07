import { Input, InputField } from "../ui/input";
import { Button } from "../ui/button";
import React from "react";
import { VStack } from "../ui/vstack";

export type Question = {
  type?: "text" | "password";
  key: string;
  label: string;
  helperText?: string;
  inputProps?: React.ComponentProps<typeof Input>;
  fieldProps?: React.ComponentProps<typeof InputField>;
};

export type FormData = Record<string, string>;

export type ButtonProps = {
  label: string;
  onPress: (formData: FormData) => void;
} & Omit<React.ComponentProps<typeof Button>, "onPress" | "label">;

export type FormProps = {
  questions: Question[];
  errors?: Record<string, string>;
  onChange?: (key: string, value: string, formData: FormData) => void;
  isFormDisabled?: boolean;
  button?: ButtonProps | ButtonProps[];
  containerProps?: React.ComponentProps<typeof VStack>;
};
