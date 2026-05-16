import { useCallback } from "react";
import { ListRenderItem } from "react-native";
import { Box } from "@/components/ui/box";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { Carousel } from "@/components/elements/carousel";
import { useFollowRecommendations } from "@/lib/api/hooks/useFollows";
import { RecommendedUser } from "@/lib/api/types";
import { FriendRecommendationItem } from "./FriendRecommendationItem";
import {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionIcon,
  AccordionItem,
  AccordionTitleText,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ChevronDown } from "lucide-react-native";

export const FriendRecommendationList = () => {
  const { data, isLoading, isError } = useFollowRecommendations();

  const items = data?.pages[0]?.result ?? [];

  const renderItem: ListRenderItem<RecommendedUser> = useCallback(
    ({ item }) => <FriendRecommendationItem user={item} />,
    [],
  );

  const keyExtractor = useCallback((item: RecommendedUser) => item.id, []);

  if (isLoading) {
    return (
      <Box className="items-center justify-center py-8">
        <Spinner />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box className="items-center justify-center py-8">
        <Text className="text-typography-500">
          Failed to load recommendations.
        </Text>
      </Box>
    );
  }

  if (!items.length) return null;

  return (
    <Accordion
      type="single"
      variant="unfilled"
      defaultValue={["recommendations"]}
    >
      <AccordionItem value="recommendations">
        <AccordionHeader>
          <AccordionTrigger>
            <AccordionTitleText>People you may know</AccordionTitleText>
            <AccordionIcon
              as={ChevronDown}
              className="data-[state=open]:rotate-180"
            />
          </AccordionTrigger>
        </AccordionHeader>
        <AccordionContent className="p-0">
          <Carousel
            items={items}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            paddingLeft={12}
          />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};
