import React from "react";
import { Input, InputField } from "../ui/input";
import { AddIcon } from "../ui/icon";
import { Href } from "expo-router";
import { ProfileAvatarProps } from "../elements";

export const nameToIcon = {
  add: AddIcon,
} as const;

export type GluestackRightAction = {
  icon: keyof typeof nameToIcon;
  handler: (key: string) => void;
};

export type FaRightAction = {
  faIcon: string;
  faIconActive?: string;
  handler: (key: string) => void;
};

export type RightAction = GluestackRightAction | FaRightAction;

export type AutocompleteOption = {
  key: string;
  label: string;
  thumbnail?: string;
  avatarProps?: ProfileAvatarProps;
  hideAction?: boolean;
  href?: Href;
  bookmarkId?: string | null;
};

export type AutocompleteProps = {
  options: AutocompleteOption[];
  isLoading?: boolean;
  inputProps?: React.ComponentProps<typeof Input>;
  fieldProps?: React.ComponentProps<typeof InputField>;
  onChange: (input: string) => void;
  onClear?: () => void;
  overlay?: boolean;
  rightActions?: RightAction[];
};
