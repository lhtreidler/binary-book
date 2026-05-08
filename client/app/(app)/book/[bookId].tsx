import { Box } from "@/components/ui/box";
import { HStack } from "@/components/ui/hstack";
import { Image } from "@/components/ui/image";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { useBookDetail } from "@/lib/api/hooks/useBooks";
import { useLocalSearchParams } from "expo-router";
import { ScrollView } from "react-native";

const scoreColorClass = (score: number) => {
  if (score >= 6.7) return "text-success-700";
  if (score >= 3.3) return "text-warning-600";
  return "text-error-600";
};

export default function BookDetail() {
  const { googleId } = useLocalSearchParams<{ googleId: string }>();
  const { data, isLoading, isError } = useBookDetail(googleId);

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
              <Text
                bold
                size="2xl"
                className={scoreColorClass(data.userScore)}
              >
                {data.userScore.toFixed(1)}
              </Text>
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

        {data.categories.length > 0 && (
          <HStack space="xs" className="flex-wrap">
            {data.categories.map((c) => (
              <Box
                key={c}
                className="rounded-full bg-background-100 px-3 py-1"
              >
                <Text size="xs" className="text-typography-700">
                  {c}
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
    </ScrollView>
  );
}
