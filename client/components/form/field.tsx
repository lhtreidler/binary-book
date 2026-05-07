import { Input, InputField } from "../ui/input";
import { Question } from "./types";

export const Field = ({
  question,
  onChange,
  isFormDisabled,
}: {
  question: Question;
  onChange: (key: string, value: string) => void;
  isFormDisabled?: boolean;
}) => {
  const { key, inputProps = {}, type, fieldProps = {} } = question;

  return (
    <Input size="md" isDisabled={isFormDisabled} {...inputProps}>
      <InputField
        type={type}
        onChangeText={(text) => onChange(key, text)}
        {...fieldProps}
      />
    </Input>
  );
};
