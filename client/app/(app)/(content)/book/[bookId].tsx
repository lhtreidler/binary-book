import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Box } from "@/components/ui/box";
import { Button } from "@/components/ui/button";
import { HStack } from "@/components/ui/hstack";
import { Image } from "@/components/ui/image";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { RankingModal } from "@/components/ranking-modal/RankingModal";
import {
  useBookDetail,
  useCreateBookmark,
  useDeleteBookmark,
} from "@/lib/api/hooks";
import { useLocalSearchParams } from "expo-router";
import { ScrollView } from "react-native";

const scoreColorClass = (score: number) => {
  if (score >= 6.7) return "text-success-700";
  if (score >= 3.3) return "text-warning-600";
  return "text-error-600";
};

export default function BookDetail() {
  const { bookId } = useLocalSearchParams<{ bookId: string }>();
  const { data, isLoading, isError } = useBookDetail(bookId);
  const { mutate: createBookmark } = useCreateBookmark();
  const { mutate: deleteBookmark } = useDeleteBookmark();
  const [isRankModalOpen, setIsRankModalOpen] = useState(false);
  const queryClient = useQueryClient();

  if (isLoading) {
    return (
      <Box className="flex-1 items-center justify-center">
        <Spinner />
      </Box>
    );
  }

  if (isError || !data) {
    return (
      <Box className="flex-1 items-center justify-center px-4">
        <Text>Failed to load book details. Please try again later.</Text>
      </Box>
    );
  }

  const authorStr = data.authors.length
    ? data.authors.join(", ")
    : "Unknown Author";

  return (
    <ScrollView>
      <VStack space="md" className="p-4">
        <HStack space="md" className="items-start">
          {data.thumbnail ? (
            <Image
              size="none"
              source={{ uri: data.thumbnail }}
              alt={data.title ?? "Book cover"}
              className="h-48 w-32 rounded-md"
              resizeMode="cover"
            />
          ) : (
            <Box className="h-48 w-32 items-center justify-center rounded-md bg-background-100">
              <Text size="sm" className="text-typography-500">
                No cover
              </Text>
            </Box>
          )}
          <VStack className="flex-1" space="xs">
            <Text size="xl" bold>
              {data.title ?? "Untitled"}
            </Text>
            <Text className="text-typography-500">{authorStr}</Text>
            {data.userScore !== null && (
              <Text bold size="2xl" className={scoreColorClass(data.userScore)}>
                {data.userScore.toFixed(1)}
              </Text>
            )}
            {data.userScore === null && (
              <HStack space="sm">
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-full self-start"
                  onPress={() =>
                    data.bookmarkId
                      ? deleteBookmark(data.bookmarkId)
                      : createBookmark(data.apiId)
                  }
                >
                  <FontAwesome
                    name={data.bookmarkId ? "bookmark" : "bookmark-o"}
                    size={16}
                  />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-full self-start"
                  onPress={() => setIsRankModalOpen(true)}
                >
                  <FontAwesome name="plus" size={16} />
                </Button>
              </HStack>
            )}
          </VStack>
        </HStack>

        {(data.publishedDate || data.pageCount !== null) && (
          <HStack space="md">
            {data.publishedDate && (
              <Text size="sm" className="text-typography-500">
                Published {data.publishedDate}
              </Text>
            )}
            {data.pageCount !== null && (
              <Text size="sm" className="text-typography-500">
                {data.pageCount} pages
              </Text>
            )}
          </HStack>
        )}

        {data.tags.length > 0 && (
          <HStack space="xs" className="flex-wrap">
            {data.tags.map((tag) => (
              <Box key={tag} className="rounded-full bg-background-100 px-3 py-1">
                <Text size="xs" className="text-typography-700">
                  {tag}
                </Text>
              </Box>
            ))}
          </HStack>
        )}

        {data.description && (
          <VStack space="xs">
            <Text bold size="md">
              About
            </Text>
            <Text className="text-typography-700">{data.description}</Text>
          </VStack>
        )}
      </VStack>
      <RankingModal
        book={{
          apiId: data.apiId,
          id: null,
          title: data.title ?? "Untitled",
          authors: data.authors,
          thumbnail: data.thumbnail ?? "",
          isRanked: false,
          bookmarkId: data.bookmarkId,
        }}
        isOpen={isRankModalOpen}
        onClose={() => {
          setIsRankModalOpen(false);
          queryClient.invalidateQueries({ queryKey: ["books", "detail"] });
        }}
      />
    </ScrollView>
  );
}
