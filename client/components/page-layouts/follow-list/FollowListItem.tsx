import { Button, ButtonText } from "@/components/ui/button";
import { HStack } from "@/components/ui/hstack";
import { Pressable } from "@/components/ui/pressable";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { ProfileAvatar } from "@/components/elements";
import { useFollow, useUnfollow } from "@/lib/api/hooks/useFollows";
import { FollowListUser } from "@/lib/api/types";
import { router } from "expo-router";

type FollowListItemProps = {
  item: FollowListUser;
  /** "follow" shows "Follow Back", "unfollow" shows "Unfollow", undefined hides the button */
  action?: "follow" | "unfollow";
};

export const FollowListItem = ({ item, action }: FollowListItemProps) => {
  const follow = useFollow(item.id);
  const unfollow = useUnfollow(item.id);
  const isPending = follow.isPending || unfollow.isPending;

  const fullName = [item.firstName, item.lastName].filter(Boolean).join(" ");

  return (
    <Pressable onPress={() => router.push(`/profile/${item.id}`)}>
      <HStack
        space="md"
        className="items-center px-4 py-3 border-b border-outline-200"
      >
        <ProfileAvatar
          profileImg={item.profileImg}
          firstName={item.firstName}
          lastName={item.lastName}
          username={item.username}
          size="md"
        />
        <VStack className="flex-1">
          {fullName ? <Text className="font-semibold">{fullName}</Text> : null}
          {item.username ? (
            <Text className="text-gray-500 text-sm">@{item.username}</Text>
          ) : null}
        </VStack>
        {action === "follow" && (
          <Button
            size="sm"
            onPress={() => follow.mutate()}
            isDisabled={isPending}
          >
            <ButtonText>Follow Back</ButtonText>
          </Button>
        )}
        {action === "unfollow" && (
          <Button
            size="sm"
            action="secondary"
            variant="outline"
            onPress={() => unfollow.mutate()}
            isDisabled={isPending}
          >
            <ButtonText>Unfollow</ButtonText>
          </Button>
        )}
      </HStack>
    </Pressable>
  );
};
