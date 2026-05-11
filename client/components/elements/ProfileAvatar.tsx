import { ComponentProps } from "react";
import { Avatar, AvatarFallbackText, AvatarImage } from "../ui/avatar";

export const ProfileAvatar = ({
  thumbnail,
  name,
  lastName,
  ...props
}: {
  thumbnail?: string | null;
  name?: string | null;
  lastName?: string | null;
} & ComponentProps<typeof Avatar>) => {
  const createInitials = () => {
    if (!name && !lastName) return "?";

    if (!lastName) return name?.toUpperCase().slice(0, 2);

    return `${name?.toUpperCase()[0]}${lastName?.toUpperCase()[0]}`;
  };
  return (
    <Avatar {...props}>
      <AvatarFallbackText>{createInitials()}</AvatarFallbackText>
      <AvatarImage source={{ uri: thumbnail ?? undefined }} />
    </Avatar>
  );
};
