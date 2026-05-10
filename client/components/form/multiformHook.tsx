import { useState } from "react";
import { FormProps, MultiFormProps } from "./types";

export const useMultiForm = ({ forms }: MultiFormProps) => {
  const [index, setIndex] = useState(0);
  const [history, setHistory] = useState<Record<string, any>[]>(
    Array.from({ length: forms.length }),
  );
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const {
    zodSchema,
    questions,
    disableBack = false,
    onChange,
    onNext,
  } = forms[index];

  const isLastForm = index >= questions.length;

  const handleNext = async (formData: any) => {
    if (onNext) {
      setIsLoading(true);
      const { success, errorMessage = "" } = await onNext(formData);
      if (!success) {
        setError(errorMessage);
        return;
      }
    }

    setHistory((prev) => {
      prev[index] = formData;
      return prev;
    });
    if (index < questions.length) setIndex((prev) => prev + 1);

    setIsLoading(false);
  };

  const showBackButton = index > 0 && !disableBack;

  const handleBack = () => {
    if (showBackButton) {
      setIndex((prev) => prev - 1);
    }
  };

  const buttonContainerProps = {
    className: `flex ${showBackButton ? "justify-between" : "flex-end"} flex-row`,
  };

  const buttons = [
    ...(showBackButton
      ? [
          {
            label: "Back",
            onPress: handleBack,
          },
        ]
      : []),
    {
      label: isLastForm ? "Submit" : "Next",
      onPress: handleNext,
    },
  ];

  const formProps: FormProps = {
    questions,
    zodSchema,
    defaultData: history[index],
    error,
    buttonContainerProps,
    button: buttons,
    onChange,
    isLoading,
  };

  return {
    showBackButton: index > 0,
    index,
    isLastForm,
    formProps,
  };
};
