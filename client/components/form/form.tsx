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
import { Button, ButtonSpinner, ButtonText } from "../ui/button";
import { HStack } from "../ui/hstack";
import { VStack } from "../ui/vstack";
import type { FormData, FormProps } from "./types";
import { Field } from "./field";
import { Box } from "../ui/box";
import { Text } from "../ui/text";

export const Form = ({
  questions,
  onChange = () => {},
  isFormDisabled: isDisabled,
  button,
  containerProps = {},
  isLoading = false,
  zodSchema,
  errorMap = {},
  error,
  buttonContainerProps = {},
}: FormProps) => {
  const [formData, setFormData] = useState<FormData>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isTouched, setIsTouched] = useState(false);

  const isFormDisabled = isDisabled || isLoading;

  const handleValidation = (data: FormData) => {
    if (zodSchema) {
      const parseResult = zodSchema.safeParse(data);
      if (!parseResult.success) {
        const fieldErrors = parseResult.error.flatten().fieldErrors;
        const errors: Record<string, string> = {};
        for (const key in fieldErrors) {
          if (fieldErrors[key] && fieldErrors[key].length > 0) {
            errors[key] = fieldErrors[key][0];
          }
        }
        setErrors(errors);
        return false;
      }
    }
    return true;
  };

  const onChangeHandler = (key: string, value: string) => {
    const updatedFormData = { ...formData, [key]: value };
    if (isTouched) handleValidation(updatedFormData);
    setFormData(updatedFormData);
    onChange(key, value, updatedFormData);
  };

  const onSubmit = (buttonOnPress: (formData: FormData) => void) => {
    setIsTouched(true);
    if (handleValidation(formData)) {
      buttonOnPress(formData);
    }
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
        {...buttonContainerProps}
      >
        <HStack space="lg">
          {buttons.map(({ label, onPress, ...buttonProps }, index) => (
            <Button
              isDisabled={isFormDisabled}
              key={index}
              onPress={() => onSubmit(onPress)}
              {...buttonProps}
            >
              {isLoading ? <ButtonSpinner /> : <ButtonText>{label}</ButtonText>}
            </Button>
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
          const error = errorMap[key] || errors[key];
          return (
            <FormControl
              key={key}
              isInvalid={!!error}
              isDisabled={isFormDisabled}
            >
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
              {!!helperText &&
                (typeof helperText === "string" ? (
                  <FormControlHelper>
                    <FormControlHelperText>{helperText}</FormControlHelperText>
                  </FormControlHelper>
                ) : helperText)}
              <FormControlError>
                <FormControlErrorText className="text-red-500">
                  {error}
                </FormControlErrorText>
              </FormControlError>
            </FormControl>
          );
        })}
      </VStack>
      {getButtons()}
      {error && <Text className="text-red-500">{error}</Text>}
    </VStack>
  );
};
