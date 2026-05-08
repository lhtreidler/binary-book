import React from "react";
import { Input, InputField } from "../ui/input";
import { AddIcon } from "../ui/icon";

export const nameToIcon = {
  add: AddIcon,
} as const;

export type AutocompleteProps = {
  options: { key: string; label: string; thumbnail?: string }[];
  isLoading?: boolean;
  inputProps?: React.ComponentProps<typeof Input>;
  fieldProps?: React.ComponentProps<typeof InputField>;
  onChange: (input: string) => void;
  rightActions?: {
    icon: keyof typeof nameToIcon;
    handler: (key: string) => void;
  }[];
};
