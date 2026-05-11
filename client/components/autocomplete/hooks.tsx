import { useDebounce } from "@/lib/utils";
import { useState } from "react";
import { AutocompleteProps } from "./types";

export const useAutocomplete = ({
  onChange,
  isLoading,
  options,
}: {
  onChange: (input: string) => void;
  isLoading: boolean;
  options: AutocompleteProps["options"];
}): AutocompleteProps & { reset: () => void } => {
  const [search, setSearch] = useState("");

  const onSearchChange = async (input: string) => {
    onChange(input);
  };

  const reset = () => {
    setSearch("");
    onChange("");
  };

  useDebounce({
    value: search,
    callback: onSearchChange,
  });

  return {
    onChange: (input: string) => {
      setSearch(input);
    },
    onClear: reset,
    options,
    isLoading,
    fieldProps: { value: search },
    reset,
  };
};
