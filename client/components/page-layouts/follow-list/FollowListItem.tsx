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
  /**
   * When true, hides the button if the current user already follows this person
   * instead of showing "Unfollow". Use for non-self follow lists.
   */
  hideWhenFollowing?: boolean;
};

export const FollowListItem = ({
  item,
  hideWhenFollowing = false,
}: FollowListItemProps) => {
  const follow = useFollow(item.id);
  const unfollow = useUnfollow(item.id);
  const isPending = follow.isPending || unfollow.isPending;

  const fullName = [item.firstName, item.lastName].filter(Boolean).join(" ");

  let action: "follow" | "follow-back" | "unfollow" | undefined;
  if (item.isFollowedByYou) {
    action = hideWhenFollowing ? undefined : "unfollow";
  } else {
    action = item.isFollowingYou ? "follow-back" : "follow";
  }

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
        {(action === "follow" || action === "follow-back") && (
          <Button
            size="sm"
            onPress={() => follow.mutate()}
            isDisabled={isPending}
          >
            <ButtonText>
              {action === "follow-back" ? "Follow Back" : "Follow"}
            </ButtonText>
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
