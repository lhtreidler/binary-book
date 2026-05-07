import React from "react";
import { Input, InputField } from "../ui/input";

export type AutocompleteProps = {
  options: { key: string; label: string; image?: string }[];
  onSelect: (key: string) => void;
  isLoading?: boolean;
  inputProps?: React.ComponentProps<typeof Input>;
  fieldProps?: React.ComponentProps<typeof InputField>;
};
