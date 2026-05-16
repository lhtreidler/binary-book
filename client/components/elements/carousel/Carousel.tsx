import { useCallback, useRef, useState } from "react";
import {
  FlatList,
  ListRenderItem,
  ListRenderItemInfo,
  View,
  ViewToken,
} from "react-native";
import { Box } from "@/components/ui/box";
import { Pressable } from "@/components/ui/pressable";
import { ChevronLeft, ChevronRight } from "lucide-react-native";

const GAP = 8;

type Props<T> = {
  items: T[];
  renderItem: ListRenderItem<T>;
  keyExtractor: (item: T, index: number) => string;
  centered?: boolean;
  paddingLeft?: number;
};

export function Carousel<T>({ items, renderItem, keyExtractor, centered = false, paddingLeft = 0 }: Props<T>) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [snapInterval, setSnapInterval] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
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

  // Wrap renderItem to measure the first item's rendered width for snapToInterval
  const wrappedRenderItem = useCallback(
    (info: ListRenderItemInfo<T>) => (
      <View
        onLayout={
          info.index === 0
            ? (e) => setSnapInterval(e.nativeEvent.layout.width + GAP)
            : undefined
        }
      >
        {renderItem(info)}
      </View>
    ),
    [renderItem],
  );

  const scrollTo = (index: number) => {
    flatListRef.current?.scrollToIndex({ index, animated: true });
    setCurrentIndex(index);
  };

  // Pad so first and last items can reach center
  const itemWidth = snapInterval - GAP;
  const contentPadding =
    centered && snapInterval > 0 && containerWidth > 0
      ? (containerWidth - itemWidth) / 2
      : 0;

  return (
    <Box
      className="relative my-2"
      onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
    >
      <FlatList
        ref={flatListRef}
        horizontal
        decelerationRate="fast"
        snapToAlignment="center"
        snapToInterval={snapInterval || undefined}
        showsHorizontalScrollIndicator={false}
        data={items}
        renderItem={wrappedRenderItem}
        keyExtractor={keyExtractor}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig.current}
        ItemSeparatorComponent={() => <View style={{ width: GAP }} />}
        contentContainerStyle={{ paddingHorizontal: contentPadding, paddingLeft: contentPadding || paddingLeft }}
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
