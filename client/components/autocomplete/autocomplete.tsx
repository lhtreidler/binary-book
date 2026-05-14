import { useEffect, useState } from "react";
import { View } from "react-native";
import { Input, InputField, InputIcon, InputSlot } from "../ui/input";
import { CloseIcon } from "../ui/icon";
import { AutocompleteProps } from "./types";
import { Options } from "./Options";
import { Box } from "../ui/box";

export const Autocomplete = (props: AutocompleteProps) => {
  const {
    options,
    isLoading,
    inputProps,
    fieldProps = {},
    onChange = () => {},
    onClear,
    inputValue: value,
  } = props;

  const [isChanged, setIsChanged] = useState(false);
  const [inputHeight, setInputHeight] = useState(50);

  useEffect(() => {
    if (options.length || isLoading) setIsChanged(true);
    if (value === "") setIsChanged(false);
  }, [options, isLoading, value]);

  const getInput = () => {
    return (
      <Input {...inputProps}>
        <InputField
          variant="underlined"
          onChangeText={onChange}
          value={value}
          {...fieldProps}
        />
        {value ? (
          <InputSlot onPress={onClear} className="pr-1">
            <InputIcon as={CloseIcon} />
          </InputSlot>
        ) : null}
      </Input>
    );
  };

  return (
    <View
      className="w-full z-10 flex flex-col justify-center items-center p-4"
      style={{ backgroundColor: "white" }}
    >
      <Box className="w-5/6">
        <View onLayout={(e) => setInputHeight(e.nativeEvent.layout.height)}>
          {getInput()}
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
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 4,
            }}
          >
            <Box className="w-full bg-white">
              <Options {...props} isChanged={isChanged} />
            </Box>
          </View>
        )}
      </Box>
    </View>
  );
};
