import { Autocomplete } from "@/components/autocomplete";
import { RankingModal } from "@/components/ranking-modal/RankingModal";
import { Box } from "../ui/box";
import { useBookAutocomplete } from "./hook";

export const BookAutocomplete = ({
  isSticky = false,
}: {
  isSticky?: boolean;
}) => {
  const { autocompleteProps, modalProps } = useBookAutocomplete();

  const containerClassName = `w-full bg-transparent${isSticky ? " sticky" : ""}`;

  return (
    <Box className={containerClassName}>
      <Autocomplete
        {...autocompleteProps}
        fieldProps={{
          ...autocompleteProps.fieldProps,
          placeholder: "Search for books...",
        }}
        overlay
      />
      <RankingModal {...modalProps} />
    </Box>
  );
};
