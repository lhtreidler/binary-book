import { LoadingView } from "@/components/layout";
import { useGetProfile } from "@/lib/api/hooks/useUsers";
import { useLocalSearchParams } from "expo-router";
import { View } from "react-native";

export default function UserProfile() {
  const { friendId } = useLocalSearchParams();
  const { data, isLoading } = useGetProfile({ friendId: friendId.toString() });

  if (isLoading) {
    return <LoadingView />;
  }

  console.log(data);

  return <View></View>;
}
