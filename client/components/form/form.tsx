import { useState } from "react";
import {
  FormControl,
  FormControlError,
  FormControlErrorText,
  FormControlHelper,
  FormControlHelperText,
  FormControlLabel,
  FormControlLabelText,
} from "../ui/form-control";
import { Button } from "../ui/button";
import { HStack } from "../ui/hstack";
import { VStack } from "../ui/vstack";
import type { FormData, FormProps } from "./types";
import { Field } from "./field";
import { Box } from "../ui/box";

export const Form = ({
  questions,
  errors = {},
  onChange = () => {},
  isFormDisabled,
  button,
  containerProps = {},
}: FormProps) => {
  const [formData, setFormData] = useState<FormData>({});

  const onChangeHandler = (key: string, value: string) => {
    const updatedFormData = { ...formData, [key]: value };
    setFormData(updatedFormData);
    onChange(key, value, updatedFormData);
  };

  const getButtons = () => {
    if (!button) return null;
    const buttons = Array.isArray(button) ? button : [button];
    return (
      <Box
        style={{
          display: "flex",
          alignItems: "center",
          width: "100%",
        }}
      >
        <HStack space="lg">
          {buttons.map(({ label, onPress, ...buttonProps }, index) => (
            <Button
              key={index}
              label={label}
              onPress={() => onPress(formData)}
              {...buttonProps}
            />
          ))}
        </HStack>
      </Box>
    );
  };

  return (
    <VStack
      space="lg"
      style={{
        paddingHorizontal: 16,
        paddingVertical: 10,
        width: "100%",
      }}
      {...containerProps}
    >
      <VStack space="md">
        {questions.map((q) => {
          const { key, label, helperText } = q;
          const error = errors[key];
          return (
            <FormControl key={key}>
              {label ? (
                <FormControlLabel>
                  <FormControlLabelText>{label}</FormControlLabelText>
                </FormControlLabel>
              ) : null}
              <Field
                question={q}
                onChange={onChangeHandler}
                isFormDisabled={isFormDisabled}
              />
              {helperText ? (
                <FormControlHelper>
                  <FormControlHelperText>{helperText}</FormControlHelperText>
                </FormControlHelper>
              ) : null}
              {error && (
                <FormControlError>
                  <FormControlErrorText className="text-red-500">
                    {error}
                  </FormControlErrorText>
                </FormControlError>
              )}
            </FormControl>
          );
        })}
      </VStack>
      {getButtons()}
    </VStack>
  );
};
