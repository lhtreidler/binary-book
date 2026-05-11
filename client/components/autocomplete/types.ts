import React from "react";
import { Input, InputField } from "../ui/input";
import { AddIcon } from "../ui/icon";
import { Href } from "expo-router";

export const nameToIcon = {
  add: AddIcon,
} as const;

export type AutocompleteOption = {
  key: string;
  label: string;
  thumbnail?: string;
  isAvatar?: boolean;
  hideAction?: boolean;
  href?: Href;
};

export type AutocompleteProps = {
  options: AutocompleteOption[];
  isLoading?: boolean;
  inputProps?: React.ComponentProps<typeof Input>;
  fieldProps?: React.ComponentProps<typeof InputField>;
  onChange: (input: string) => void;
  onClear?: () => void;
  overlay?: boolean;
  rightActions?: {
    icon: keyof typeof nameToIcon;
    handler: (key: string) => void;
  }[];
};
