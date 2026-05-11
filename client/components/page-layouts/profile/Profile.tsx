import { ScrollView } from "react-native";
import { router } from "expo-router";
import { useSession } from "@/session/ctx";
import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Pressable } from "@/components/ui/pressable";
import { ProfileAvatar } from "@/components/elements";
import { LoadingView } from "@/components/layout";
import { ProfileProps } from "./types";
import { Text } from "@/components/ui/text";

export function Profile(props: ProfileProps) {
  const { isLoading, data, isSelf } = props;

  const { signOut } = useSession();

  if (isLoading) return <LoadingView />;

  if (!data) return <Text>User not found</Text>;

  const getFollowButton = () => {
    if (props.isSelf || !props.data) return null;

    const { isUserFollowing, isUserFollowed } = props.data;

    if (isUserFollowing) {
      return (
        <Button
          action="secondary"
          variant="outline"
          onPress={props.onUnfollow}
          isDisabled={props.isFollowPending}
        >
          <ButtonText>Following</ButtonText>
        </Button>
      );
    }

    return (
      <Button onPress={props.onFollow} isDisabled={props.isFollowPending}>
        <ButtonText>{isUserFollowed ? "Follow back" : "Follow"}</ButtonText>
      </Button>
    );
  };

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 24 }}>
      <VStack space="xl">
        <ProfileAvatar {...data} size="xl" includeDetail allowUpload={isSelf} />

        <HStack space="2xl" className="justify-center">
          <Pressable
            onPress={() =>
              router.push({
                pathname: "/follow/[type]",
                params: {
                  type: "followers",
                  ...(!props.isSelf && { userId: props.userId, username: data.username ?? undefined }),
                },
              })
            }
          >
            <VStack className="items-center">
              <Text className="font-bold text-lg">{data.followerCount}</Text>
              <Text className="text-gray-500 text-sm">Followers</Text>
            </VStack>
          </Pressable>
          <Pressable
            onPress={() =>
              router.push({
                pathname: "/follow/[type]",
                params: {
                  type: "following",
                  ...(!props.isSelf && { userId: props.userId, username: data.username ?? undefined }),
                },
              })
            }
          >
            <VStack className="items-center">
              <Text className="font-bold text-lg">{data.followingCount}</Text>
              <Text className="text-gray-500 text-sm">Following</Text>
            </VStack>
          </Pressable>
        </HStack>

        {getFollowButton()}
        {!props.isSelf && !!props.followError && (
          <Text>{props.followError}</Text>
        )}

        {isSelf && (
          <Box>
            <Button action="negative" onPress={signOut}>
              <ButtonText>Sign out</ButtonText>
            </Button>
          </Box>
        )}
      </VStack>
    </ScrollView>
  );
}
