import { useEffect, useState } from "react";
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
  const [isChanged, setIsChanged] = useState(false);

  useEffect(() => {
    if (options || isLoading) setIsChanged(true);
  }, [options, isLoading]);

  const getOptions = () => {
    console.log(options, isLoading, isChanged);
    if (!options.length && !isLoading && isChanged) {
      return (
        <Box className="p-2 w-full">
          <Text className="text-center">
            No results found. Please try a different search term.
          </Text>
        </Box>
      );
    }

    return options.map((option) => {
      const { key, label, thumbnail, hideAction = false } = option;
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
          {rightActions && !hideAction && (
            <HStack className="ml-2">
              {rightActions.map(({ icon, handler }, i) => (
                <Button
                  size="sm"
                  className="rounded-full"
                  variant="outline"
                  key={i}
                  onPress={() => handler(key)}
                >
                  <ButtonIcon
                    className="py-2 px-0"
                    size="sm"
                    as={nameToIcon[icon]}
                  />
                </Button>
              ))}
            </HStack>
          )}
        </Box>
      );
    });
  };

  return (
    <VStack>
      <Input {...inputProps}>
        <InputField
          variant="underlined"
          onChangeText={onChange}
          {...fieldProps}
        />
      </Input>
      {getOptions()}
      {isLoading ? <Spinner className="mt-2" /> : null}
    </VStack>
  );
};
