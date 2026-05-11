import { Form, FormProps } from "@/components/form";
import { Box } from "@/components/ui/box";
import { Button, ButtonSpinner, ButtonText } from "@/components/ui/button";
import { Center } from "@/components/ui/center";
import {
  FormControl,
  FormControlError,
  FormControlErrorText,
  FormControlHelper,
  FormControlHelperText,
  FormControlLabel,
  FormControlLabelText,
} from "@/components/ui/form-control";
import { HStack } from "@/components/ui/hstack";
import { CheckCircleIcon, Icon, SlashIcon } from "@/components/ui/icon";
import { Input, InputField } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { z } from "zod";
import { VStack } from "@/components/ui/vstack";
import {
  UpdateUserInput,
  useCheckUsername,
  useIsAccountSetUp,
  useUpdateUser,
} from "@/lib/api/hooks/useAuth";
import { useDebounce } from "@/lib/utils";
import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { LoadingView } from "@/components/layout";

type BaseProps = {
  error?: string;
  isLoading: boolean;
  onSubmit: (data: UpdateUserInput) => void;
};

const usernameSchema = z
  .string()
  .min(4, "Username must be at least 4 characters")
  .max(20, "Username must be 20 characters or less")
  .regex(/^[a-z0-9_.]+$/, "Username cannot contain special characters")
  .lowercase("Username must be lowercase");

const CreateUsername = ({ onSubmit, isLoading, error }: BaseProps) => {
  const [username, setUsername] = useState("");
  const [query, setQuery] = useState("");
  const accountSetUp = useIsAccountSetUp();

  const validationError = useMemo(() => {
    if (!username) return undefined;

    const parsed = usernameSchema.safeParse(username);

    if (parsed.error) {
      return parsed.error.issues[0].message;
    }

    return undefined;
  }, [username]);

  useDebounce({
    value: username,
    callback: (q) => {
      setQuery(q || "");
    },
  });

  const { data, isLoading: isCheckUsernameLoading } = useCheckUsername(
    query,
    !validationError,
  );

  const isValidUserName =
    data !== undefined &&
    !data.isTaken &&
    username === query &&
    !validationError;

  const helperTextConfig = useMemo(() => {
    if (!validationError && (isCheckUsernameLoading || username !== query)) {
      return {
        text: "Checking availability...",
      };
    }

    if (!data) {
      return { text: "Choose a unique username" };
    }

    const { isTaken } = data;

    const className = isTaken ? "text-red-500" : "text-green-500";
    const icon = isTaken ? SlashIcon : CheckCircleIcon;
    const text = isTaken ? "Username is taken." : "Username is available.";

    return {
      icon: <Icon as={icon} className={`${className} pt-1`} />,
      text,
      className,
    };
  }, [data, isCheckUsernameLoading, query, username, validationError]);

  const onChange = (text: string) => {
    const formatted = text.toLowerCase().replace(/[^a-z0-9_.]/g, "");
    setUsername(formatted);
  };

  const errorMessage = validationError || error;

  const isSubmitDisabled = !isValidUserName || isLoading;

  if (accountSetUp.isLoading) return <LoadingView />;

  return (
    <VStack className="w-full" space="md">
      <Box className="w-full">
        <FormControl isInvalid={!!errorMessage}>
          <FormControlLabel>
            <FormControlLabelText>Username</FormControlLabelText>
          </FormControlLabel>
          <Input isDisabled={isLoading}>
            <InputField onChangeText={onChange} value={username} />
          </Input>
          {!!helperTextConfig.text && !errorMessage && (
            <FormControlHelper>
              <FormControlHelperText>
                <HStack space="xs">
                  {helperTextConfig.icon || ""}
                  <Text className={helperTextConfig.className || ""}>
                    {helperTextConfig.text}
                  </Text>
                </HStack>
              </FormControlHelperText>
            </FormControlHelper>
          )}
          <FormControlError>
            <FormControlErrorText className="text-red-500">
              {errorMessage}
            </FormControlErrorText>
          </FormControlError>
        </FormControl>
      </Box>
      <Box className="flex justify-end flex-row">
        <Button
          className="max-w-20"
          disabled={isSubmitDisabled}
          action={isSubmitDisabled ? "secondary" : "primary"}
          onPress={() => {
            if (isValidUserName) {
              onSubmit({ username });
            }
          }}
        >
          {isLoading ? <ButtonSpinner /> : <ButtonText>Next</ButtonText>}
        </Button>
      </Box>
    </VStack>
  );
};

const NameForm = ({ onSubmit, ...rest }: BaseProps) => {
  const formProps: FormProps = {
    questions: [
      { key: "firstName", label: "First Name" },
      { key: "lastName", label: "Last Name" },
    ],
    zodSchema: z.object({
      firstName: z.string().min(1, "Please enter your first name"),
      lastName: z.string().optional(),
    }),
    button: { label: "Submit", onPress: onSubmit },
    ...rest,
  };

  return <Form {...formProps} />;
};

export default function SetupAccount() {
  const [step, setStep] = useState<"username" | "name">("username");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const updateUser = useUpdateUser();
  const queryClient = useQueryClient();

  const onSubmit = async (data: UpdateUserInput) => {
    const isUsernameStep = step === "username";
    try {
      setIsLoading(true);
      await updateUser.mutateAsync(data);
      if (isUsernameStep) {
        setStep("name");
      } else {
        queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
      }
      setError("");
    } catch {
      setError(
        isUsernameStep
          ? "Failed to update username. Please try again."
          : "Failed to update user details. Please try again.",
      );
    }
    setIsLoading(false);
  };

  const props = {
    isLoading,
    error,
    onSubmit,
  };

  return (
    <Center className="h-full p-8">
      {step === "username" ? (
        <CreateUsername {...props} />
      ) : (
        <NameForm {...props} />
      )}
    </Center>
  );
}
