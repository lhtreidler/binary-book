import { useEffect, useState } from "react";
import { ScrollView, View } from "react-native";
import { Box } from "../ui/box";
import { Button, ButtonIcon } from "../ui/button";
import { HStack } from "../ui/hstack";
import { Image } from "../ui/image";
import { Input, InputField, InputIcon, InputSlot } from "../ui/input";
import { CloseIcon } from "../ui/icon";
import { Spinner } from "../ui/spinner";
import { Text } from "../ui/text";
import { VStack } from "../ui/vstack";
import { AutocompleteOption, AutocompleteProps, nameToIcon } from "./types";
import { ProfileAvatar } from "../elements";
import { Link } from "expo-router";

const Option = ({
  id: key,
  label,
  thumbnail,
  avatarProps,
  hideAction = false,
  rightActions,
  href,
}: Omit<AutocompleteOption, "key"> & {
  id: string;
  rightActions: AutocompleteProps["rightActions"];
}) => {
  const getContent = () => {
    return (
      <Box
        key={key}
        className="bg-slate-50 border-gray-700 py-2 px-4 border-b-hairline flex flex-row items-center w-full gap-3"
      >
        {avatarProps && <ProfileAvatar size="sm" {...avatarProps} />}

        {thumbnail && !avatarProps && (
          <Box className="w-1/4 aspect-[2/3]" style={{ width: 70 }}>
            <Image
              size="xs"
              source={{ uri: thumbnail }}
              alt={label}
              className="w-full h-full"
            />
          </Box>
        )}
        <Box className="flex-1">
          <Text>{label}</Text>
        </Box>

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
  };

  return href ? <Link href={href}>{getContent()}</Link> : getContent();
};

export const Autocomplete = ({
  options,
  isLoading,
  inputProps,
  fieldProps = {},
  onChange = () => {},
  onClear,
  rightActions = [],
  overlay = false,
}: AutocompleteProps) => {
  const [isChanged, setIsChanged] = useState(false);
  const [inputHeight, setInputHeight] = useState(50);

  useEffect(() => {
    if (options.length || isLoading) setIsChanged(true);
    if (fieldProps.value === "") setIsChanged(false);
  }, [options, isLoading, fieldProps.value]);

  const getOptions = () => {
    if (!options.length && !isLoading && isChanged) {
      return (
        <Box className="p-2 w-full">
          <Text className="text-center">
            No results found. Please try a different search term.
          </Text>
        </Box>
      );
    }

    return options.map(({ key, ...option }) => (
      <Option key={key} id={key} {...option} rightActions={rightActions} />
    ));
  };

  if (overlay) {
    return (
      <View style={{ zIndex: 100, backgroundColor: "white" }}>
        <View
          style={{ paddingHorizontal: 16, paddingVertical: 10 }}
          onLayout={(e) => setInputHeight(e.nativeEvent.layout.height)}
        >
          <Input {...inputProps}>
            <InputField
              variant="underlined"
              onChangeText={onChange}
              {...fieldProps}
            />
            {fieldProps.value ? (
              <InputSlot onPress={onClear} className="pr-1">
                <InputIcon as={CloseIcon} />
              </InputSlot>
            ) : null}
          </Input>
        </View>
        {isChanged && (
          <View
            style={{
              position: "absolute",
              top: inputHeight,
              left: 0,
              right: 0,
              backgroundColor: "white",
              maxHeight: 400,
              zIndex: 100,
              elevation: 5,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.15,
              shadowRadius: 4,
            }}
          >
            <ScrollView>
              <View style={{ paddingVertical: 8 }}>
                {getOptions()}
                {isLoading ? <Spinner className="my-4" /> : null}
              </View>
            </ScrollView>
          </View>
        )}
      </View>
    );
  }

  return (
    <VStack>
      <Input {...inputProps}>
        <InputField
          variant="underlined"
          onChangeText={onChange}
          {...fieldProps}
        />
        {fieldProps.value ? (
          <InputSlot onPress={onClear} className="pr-1">
            <InputIcon as={CloseIcon} />
          </InputSlot>
        ) : null}
      </Input>
      {getOptions()}
      {isLoading ? <Spinner className="mt-2" /> : null}
    </VStack>
  );
};
