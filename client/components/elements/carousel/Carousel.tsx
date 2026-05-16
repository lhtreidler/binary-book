import { useCallback, useRef, useState } from "react";
import { FlatList, ListRenderItem, ViewToken } from "react-native";
import { Box } from "@/components/ui/box";
import { Pressable } from "@/components/ui/pressable";
import { ChevronLeft, ChevronRight } from "lucide-react-native";

type Props<T> = {
  items: T[];
  renderItem: ListRenderItem<T>;
  keyExtractor: (item: T, index: number) => string;
};

export function Carousel<T>({ items, renderItem, keyExtractor }: Props<T>) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList<T>>(null);

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0) {
        setCurrentIndex(viewableItems[0].index ?? 0);
      }
    },
    [],
  );

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 50 });

  const scrollTo = (index: number) => {
    flatListRef.current?.scrollToIndex({ index, animated: true });
    setCurrentIndex(index);
  };

  return (
    <Box className="relative">
      <FlatList
        ref={flatListRef}
        horizontal
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        data={items}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig.current}
      />
      {currentIndex > 0 && (
        <Pressable
          className="absolute left-2 top-0 bottom-0 justify-center z-10"
          onPress={() => scrollTo(currentIndex - 1)}
        >
          <Box className="bg-white/80 rounded-full p-1">
            <ChevronLeft size={20} color="#374151" />
          </Box>
        </Pressable>
      )}
      {currentIndex < items.length - 1 && (
        <Pressable
          className="absolute right-2 top-0 bottom-0 justify-center z-10"
          onPress={() => scrollTo(currentIndex + 1)}
        >
          <Box className="bg-white/80 rounded-full p-1">
            <ChevronRight size={20} color="#374151" />
          </Box>
        </Pressable>
      )}
    </Box>
  );
}
