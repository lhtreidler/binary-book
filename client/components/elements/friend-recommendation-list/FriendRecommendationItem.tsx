import { RecommendedUser } from "@/lib/api/types";
import { Pressable } from "@/components/ui/pressable";
import { VStack } from "@/components/ui/vstack";
import { Button, ButtonText } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { ProfileAvatar } from "@/components/elements/ProfileAvatar";
import { useFollow } from "@/lib/api/hooks/useFollows";
import { router } from "expo-router";
import { Card } from "@/components/ui/card";

type Props = {
  user: RecommendedUser;
};

export const FriendRecommendationItem = ({ user }: Props) => {
  const follow = useFollow(user.id);
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ");

  return (
    <Card size="sm">
      <Pressable
        className="items-center justify-center py-2"
        onPress={() => router.push(`/profile/${user.id}`)}
      >
        <VStack space="xs" className="items-center">
          <ProfileAvatar
            profileImg={user.profileImg}
            firstName={user.firstName}
            lastName={user.lastName}
            username={user.username}
            size="md"
          />
          {fullName ? (
            <Text className="font-semibold text-center">{fullName}</Text>
          ) : null}
          {user.username ? (
            <Text className="text-gray-500 text-sm">@{user.username}</Text>
          ) : null}
          <Text className="text-typography-400 text-xs text-center">
            Followed by {user.mutualFollowers}{" "}
            {user.mutualFollowers === 1 ? "person" : "people"} you follow
          </Text>
          <Button
            size="sm"
            isDisabled={follow.isPending || follow.isSuccess}
            onPress={() => follow.mutate()}
          >
            <ButtonText>{follow.isSuccess ? "Following" : "Follow"}</ButtonText>
          </Button>
        </VStack>
      </Pressable>
    </Card>
  );
};
