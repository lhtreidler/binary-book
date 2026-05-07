import { Box } from "../ui/box";
import { Input, InputField } from "../ui/input";
import { Text } from "../ui/text";
import { VStack } from "../ui/vstack";
import { AutocompleteProps } from "./types";

export const Autocomplete = ({
  options,
  onSelect,
  isLoading,
  inputProps,
  fieldProps,
}: AutocompleteProps) => {
  return (
    <VStack>
      <Input isDisabled={isLoading} {...inputProps}>
        <InputField {...fieldProps} />
      </Input>
      {options.map(({ key, label, image }) => {
        return (
          <div key={key} onClick={() => onSelect(key)}>
            <Box>
              <Text>{label}</Text>
            </Box>
          </div>
        );
      })}
    </VStack>
  );
};
