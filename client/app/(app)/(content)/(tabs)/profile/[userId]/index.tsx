import { UserProfile } from "@/components/pages/user-profile";
import { useLocalSearchParams } from "expo-router";

export default function Profile() {
  const { userId } = useLocalSearchParams();

  return <UserProfile userId={userId.toString()} />;
}
