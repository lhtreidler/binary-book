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
}): AutocompleteProps => {
  const [search, setSearch] = useState("");

  const onSearchChange = async (input: string) => {
    onChange(input);
  };

  useDebounce({
    value: search,
    callback: onSearchChange,
  });

  return {
    onChange: (input: string) => {
      setSearch(input);
    },
    options,
    isLoading,
  };
};
