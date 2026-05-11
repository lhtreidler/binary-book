import { Profile } from "@/components/page-layouts/profile";
import { useMyProfile } from "./hooks";

export const MyProfile = () => {
  const profileProps = useMyProfile();

  return <Profile isSelf {...profileProps} />;
};
