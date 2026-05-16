import { useState } from "react";
import { VStack } from "@/components/ui/vstack";
import { Text } from "@/components/ui/text";

const OVERHEAD_PX = 30; // approximation of container padding, gap, and divider

type Props = {
  title: string;
  authors: string[];
  maxHeight?: number;
};

export const BookOptionContent = ({ title, authors, maxHeight }: Props) => {
  const [lineHeight, setLineHeight] = useState(20);

  const authorStr = authors.length ? authors.join(", ") : "Unknown Author";

  const titleLines = maxHeight
    ? Math.max(1, Math.floor((maxHeight - OVERHEAD_PX - lineHeight) / lineHeight))
    : undefined;

  return (
    <VStack space="xs">
      <Text className="font-bold" numberOfLines={titleLines}>
        {title}
      </Text>
      <Text
        numberOfLines={1}
        onLayout={(e) => setLineHeight(e.nativeEvent.layout.height)}
      >
        by {authorStr}
      </Text>
    </VStack>
  );
};
