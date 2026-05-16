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
    onViewAll,
    overlay,
    inputValue: value,
  } = props;

  const [isChanged, setIsChanged] = useState(false);
  const [isDropdownVisible, setIsDropdownVisible] = useState(true);
  const [inputHeight, setInputHeight] = useState(50);

  useEffect(() => {
    if (options.length || isLoading) {
      setIsChanged(true);
      setIsDropdownVisible(true);
    }
    if (value === "") setIsChanged(false);
  }, [options, isLoading, value]);

  const getInput = () => {
    return (
      <Input {...inputProps}>
        <InputField
          variant="underlined"
          onChangeText={onChange}
          value={value}
          onFocus={overlay ? () => { if (isChanged) setIsDropdownVisible(true); } : undefined}
          onBlur={overlay ? () => { setTimeout(() => setIsDropdownVisible(false), 150); } : undefined}
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

  const showDropdown = isChanged && (!overlay || isDropdownVisible);

  return (
    <View
      className="w-full z-10 flex flex-col justify-center items-center p-4"
      style={{ backgroundColor: "white" }}
    >
      <Box className="w-5/6">
        <View onLayout={(e) => setInputHeight(e.nativeEvent.layout.height)}>
          {getInput()}
        </View>
        {showDropdown && (
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
              <Options {...props} isChanged={isChanged} onViewAll={onViewAll} />
            </Box>
          </View>
        )}
      </Box>
    </View>
  );
};
