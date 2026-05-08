import { Box } from "../ui/box";
import { Image } from "../ui/image";
import { Input, InputField } from "../ui/input";
import { Pressable } from "../ui/pressable";
import { Spinner } from "../ui/spinner";
import { Text } from "../ui/text";
import { VStack } from "../ui/vstack";
import { AutocompleteProps } from "./types";

export const Autocomplete = ({
  options,
  onSelect,
  isLoading,
  inputProps,
  fieldProps,
  onChange = () => {},
  rightAction = <></>,
}: AutocompleteProps) => {
  return (
    <VStack>
      <Input {...inputProps}>
        <InputField onChangeText={onChange} {...fieldProps} />
      </Input>
      {options
        ? options.map(({ key, label, thumbnail }) => {
            return (
              <Pressable key={key} onPress={() => onSelect(key)}>
                <Box className="bg-slate-50 border-gray-700 py-2 px-4 border-b-hairline flex flex-row items-center w-full gap-3">
                  <Box className="flex-1">
                    <Text>{label}</Text>
                  </Box>
                  {thumbnail ? (
                    <Box className="w-1/4 aspect-[2/3]" style={{ width: 70 }}>
                      <Image
                        size="xs"
                        source={{ uri: thumbnail }}
                        alt={label}
                        className="w-full h-full"
                      />
                    </Box>
                  ) : null}
                  {rightAction}
                </Box>
              </Pressable>
            );
          })
        : null}
      {isLoading ? <Spinner /> : null}
    </VStack>
  );
};
