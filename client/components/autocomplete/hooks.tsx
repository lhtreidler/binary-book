import { useDebounce } from "@/lib/utils";
import { useState } from "react";
import { AutocompleteProps } from "./types";

export const useAutocomplete = (
  requestFunc: (input: string) => Promise<AutocompleteProps["options"]>,
): AutocompleteProps => {
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [options, setOptions] = useState<AutocompleteProps["options"]>([]);

  const onSearchChange = async (input: string) => {
    if (input) {
      setIsLoading(true);
      try {
        const options = await requestFunc(input);
        setOptions(options);
      } finally {
        setIsLoading(false);
      }
    }
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
