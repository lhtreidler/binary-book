import { LoadingView } from "@/components/layout";
import { Center } from "@/components/ui/center";
import { Text } from "@/components/ui/text";
import { useMe } from "@/lib/api";
import { View } from "react-native";

export default function Tab() {
  const { data } = useMe();

  if (!data?.firstName) return <LoadingView />;

  return (
    <View>
      <Center className="w-full p-2">
        <Text className="text-center" bold size="xl">
          Hi, {data.firstName}!
        </Text>
      </Center>
    </View>
  );
}
