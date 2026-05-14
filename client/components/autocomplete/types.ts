import React from "react";
import { Input, InputField } from "../ui/input";
import { AddIcon } from "../ui/icon";
import { Bookmark } from "lucide-react-native";
import { Href } from "expo-router";
import { ProfileAvatarProps } from "../elements";

export const icons = {
  add: AddIcon,
  bookmark: Bookmark,
} as const;

export type RightAction = {
  icon: keyof typeof icons;
  handler: (key: string) => void;
  isActive?: boolean;
};

export type AutocompleteOption = {
  id: string;
  label: string;
  thumbnail?: string | null;
  hasThumbnail?: boolean;
  avatarProps?: ProfileAvatarProps;
  hideAction?: boolean;
  href?: Href;
  rightActions?: RightAction[] | RightAction;
};

export type AutocompleteProps = {
  options: AutocompleteOption[];
  isLoading?: boolean;
  inputProps?: React.ComponentProps<typeof Input>;
  fieldProps?: Omit<React.ComponentProps<typeof InputField>, "value">;
  onChange: (input: string) => void;
  onClear?: () => void;
  overlay?: boolean;
  inputValue: string;
};
