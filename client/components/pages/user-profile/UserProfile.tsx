import { Profile } from "@/components/page-layouts/profile";
import { useProfile } from "./hooks";

export const UserProfile = (props: { userId: string }) => {
  const profileProps = useProfile(props);

  return <Profile isSelf={false} {...profileProps} />;
};
