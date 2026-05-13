import { useEffect, useState } from "react";
import { ScrollView, View } from "react-native";
import { Input, InputField, InputIcon, InputSlot } from "../ui/input";
import { CloseIcon } from "../ui/icon";
import { Spinner } from "../ui/spinner";
import { VStack } from "../ui/vstack";
import { AutocompleteProps } from "./types";
import { Options } from "./Options";

export const Autocomplete = (props: AutocompleteProps) => {
  const {
    options,
    isLoading,
    inputProps,
    fieldProps = {},
    onChange = () => {},
    onClear,
    overlay = false,
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

  if (overlay) {
    return (
      <View style={{ zIndex: 100, backgroundColor: "white" }}>
        <View
          style={{ paddingHorizontal: 16, paddingVertical: 10 }}
          onLayout={(e) => setInputHeight(e.nativeEvent.layout.height)}
        >
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
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.15,
              shadowRadius: 4,
            }}
          >
            <ScrollView>
              <View style={{ paddingVertical: 8 }}>
                <Options {...props} isChanged={isChanged} />
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
      {getInput()}
      <Options {...props} isChanged={isChanged} />
      {isLoading ? <Spinner className="mt-2" /> : null}
    </VStack>
  );
};
