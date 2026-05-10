import { Input, InputField } from "../ui/input";
import { Button } from "../ui/button";
import React, { JSX } from "react";
import { VStack } from "../ui/vstack";
import { z } from "zod";
import { Box } from "../ui/box";

export type Question = {
  type?: "text" | "password" | "newPassword";
  key: string;
  label: string;
  helperText?: string | JSX.Element;
  inputProps?: React.ComponentProps<typeof Input>;
  fieldProps?: React.ComponentProps<typeof InputField>;
};

export type FormData = Record<string, string>;

export type ButtonProps = {
  label: string;
  onPress: (formData: FormData) => void;
} & Omit<React.ComponentProps<typeof Button>, "onPress" | "label">;

type Schema = z.ZodObject<Record<string, z.ZodTypeAny>>;

type OnChange = (key: string, value: string, formData: FormData) => void;

export type FormProps<T extends Schema = Schema> = {
  questions: Question[];
  zodSchema?: T;
  button?: ButtonProps | ButtonProps[];
  onChange?: OnChange;
  errorMap?: Record<string, string>;
  error?: string;
  isFormDisabled?: boolean;
  containerProps?: React.ComponentProps<typeof VStack>;
  isLoading?: boolean;
  defaultData?: Record<string, any>;
  buttonContainerProps?: React.ComponentProps<typeof Box>;
};

export type MultiFormProps = {
  forms: {
    questions: Question[];
    zodSchema: Schema;
    onChange?: OnChange;
    onNext?: (d: any) => Promise<{ success: boolean; errorMessage?: string }>;
    disableBack?: boolean;
  }[];
};
