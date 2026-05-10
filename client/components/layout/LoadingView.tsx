import { Center } from "../ui/center";
import { Spinner } from "../ui/spinner";

export const LoadingView = () => {
  return (
    <Center className="w-full h-full">
      <Spinner size="large" />
    </Center>
  );
};
