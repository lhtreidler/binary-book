import { ComponentProps, useState } from "react";
import { Avatar, AvatarFallbackText, AvatarImage } from "../ui/avatar";
import { useUploadProfileImage } from "@/lib/api/hooks/useAuth";
import * as ImagePicker from "expo-image-picker";
import { useQueryClient } from "@tanstack/react-query";
import { VStack } from "../ui/vstack";
import { Text } from "../ui/text";
import { Pressable } from "../ui/pressable";
import { Box } from "../ui/box";
import { Spinner } from "../ui/spinner";
import { Center } from "../ui/center";

export type ProfileAvatarProps = {
  profileImg?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  username?: string | null;
  /** default = false */
  allowUpload?: boolean;
  /** default = false */
  includeDetail?: boolean;
} & ComponentProps<typeof Avatar>;

export const ProfileAvatar = ({
  profileImg,
  firstName,
  lastName,
  username,
  allowUpload = false,
  includeDetail = false,
  ...props
}: ProfileAvatarProps) => {
  const uploadProfileImage = useUploadProfileImage();
  const [uploadError, setUploadError] = useState("");
  const queryClient = useQueryClient();
  const isUploading = uploadProfileImage.isPending;

  const onPickImage = async () => {
    if (!allowUpload) return;

    setUploadError("");

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setUploadError(
        "Camera roll permission is required to update your photo.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (result.canceled) return;

    const { uri: localUri, mimeType = "image/jpeg" } = result.assets[0];

    try {
      await uploadProfileImage.mutateAsync({ localUri, mimeType });
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
    } catch {
      setUploadError("Upload failed. Please try again.");
    }
  };

  const createInitials = () => {
    if (!firstName && !lastName) return "?";

    if (!lastName) return firstName?.toUpperCase().slice(0, 2);

    return `${firstName?.toUpperCase()[0]}${lastName?.toUpperCase()[0]}`;
  };

  const fullName = [firstName, lastName].filter(Boolean).join(" ");

  const getDetails = () => {
    if (!includeDetail) return null;

    return (
      <Center>
        {fullName ? (
          <Text className="text-2xl font-bold">{fullName}</Text>
        ) : null}
        {username ? <Text className="text-gray-500">@{username}</Text> : null}
      </Center>
    );
  };

  const getAvatar = () => {
    if (allowUpload) {
      return (
        <VStack className="items-center" space="md">
          <Pressable onPress={onPickImage}>
            <Avatar {...props}>
              <AvatarFallbackText>{createInitials()}</AvatarFallbackText>
              <AvatarImage source={{ uri: profileImg ?? undefined }} />
            </Avatar>
          </Pressable>
          {isUploading && (
            <Box>
              <Spinner />
            </Box>
          )}
          <Text className="text-sm text-gray-400">Tap photo to update</Text>
        </VStack>
      );
    }

    return (
      <Center>
        <Avatar {...props}>
          <AvatarFallbackText>{createInitials()}</AvatarFallbackText>
          <AvatarImage source={{ uri: profileImg ?? undefined }} />
        </Avatar>
      </Center>
    );
  };

  return (
    <VStack space="md">
      {getAvatar()}
      {getDetails()}
      {uploadError ? (
        <Text className="text-red-500 text-sm text-center">{uploadError}</Text>
      ) : null}
    </VStack>
  );
};
