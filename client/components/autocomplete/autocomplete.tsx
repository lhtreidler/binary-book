import { Box } from "../ui/box";
import { Button, ButtonIcon } from "../ui/button";
import { HStack } from "../ui/hstack";
import { Image } from "../ui/image";
import { Input, InputField } from "../ui/input";
import { Spinner } from "../ui/spinner";
import { Text } from "../ui/text";
import { VStack } from "../ui/vstack";
import { AutocompleteProps, nameToIcon } from "./types";

export const Autocomplete = ({
  options,
  isLoading,
  inputProps,
  fieldProps,
  onChange = () => {},
  rightActions = [],
}: AutocompleteProps) => {
  return (
    <VStack>
      <Input {...inputProps}>
        <InputField onChangeText={onChange} {...fieldProps} />
      </Input>
      {options
        ? options.map(({ key, label, thumbnail }) => {
            return (
              <Box
                key={key}
                className="bg-slate-50 border-gray-700 py-2 px-4 border-b-hairline flex flex-row items-center w-full gap-3"
              >
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
                {rightActions && (
                  <HStack className="ml-3">
                    {rightActions.map(({ icon, handler }, i) => (
                      <Button
                        size="sm"
                        className="rounded-full py-1"
                        variant="outline"
                        key={i}
                        onPress={() => handler(key)}
                      >
                        <ButtonIcon
                          className="py-2"
                          size="sm"
                          as={nameToIcon[icon]}
                        />
                      </Button>
                    ))}
                  </HStack>
                )}
              </Box>
            );
          })
        : null}
      {isLoading ? <Spinner /> : null}
    </VStack>
  );
};
