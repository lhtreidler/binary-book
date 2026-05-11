import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useQueryClient } from "@tanstack/react-query";
import { useMe, useUploadProfileImage } from "@/lib/api/hooks/useAuth";
import { useSession } from "@/session/ctx";
import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";

const Avatar = ({
  uri,
  initials,
  uploading,
  onPress,
}: {
  uri: string | null;
  initials: string;
  uploading: boolean;
  onPress: () => void;
}) => (
  <Pressable onPress={onPress}>
    <View style={{ width: 96, height: 96 }}>
      {uri ? (
        <Image
          source={{ uri }}
          style={{ width: 96, height: 96, borderRadius: 48 }}
        />
      ) : (
        <View
          style={{
            width: 96,
            height: 96,
            borderRadius: 48,
            backgroundColor: "#2563eb",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ color: "white", fontSize: 32, fontWeight: "600" }}>
            {initials}
          </Text>
        </View>
      )}
      {uploading && (
        <View
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 48,
            backgroundColor: "rgba(0,0,0,0.45)",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ActivityIndicator color="white" />
        </View>
      )}
    </View>
  </Pressable>
);

export default function ProfileTab() {
  const { data: user } = useMe();
  const { signOut } = useSession();
  const queryClient = useQueryClient();
  const uploadProfileImage = useUploadProfileImage();
  const [uploadError, setUploadError] = useState("");

  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(" ");
  const initials =
    [user?.firstName?.[0], user?.lastName?.[0]]
      .filter(Boolean)
      .join("")
      .toUpperCase() ||
    user?.username?.[0]?.toUpperCase() ||
    "?";

  const onPickImage = async () => {
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

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 24 }}>
      <VStack space="xl">
        <VStack className="items-center" space="md">
          <Avatar
            uri={user?.profileImg ?? null}
            initials={initials}
            uploading={uploadProfileImage.isPending}
            onPress={onPickImage}
          />
          {fullName ? (
            <Text className="text-2xl font-bold">{fullName}</Text>
          ) : null}
          {user?.username ? (
            <Text className="text-gray-500">@{user.username}</Text>
          ) : null}
          <Text className="text-sm text-gray-400">Tap photo to update</Text>
          {uploadError ? (
            <Text className="text-red-500 text-sm text-center">
              {uploadError}
            </Text>
          ) : null}
        </VStack>

        <Box>
          <Button action="negative" onPress={signOut}>
            <ButtonText>Sign out</ButtonText>
          </Button>
        </Box>
      </VStack>
    </ScrollView>
  );
}
