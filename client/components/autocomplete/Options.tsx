import { Box } from "../ui/box";
import { Image } from "../ui/image";
import { Text } from "../ui/text";
import { AutocompleteOption, AutocompleteProps } from "./types";
import { ProfileAvatar } from "../elements";
import { Link } from "expo-router";
import { Actions } from "./Actions";
import { HStack } from "../ui/hstack";
import { BookOpen } from "lucide-react-native";
import { VStack } from "../ui/vstack";
import { ButtonText, Button } from "../ui/button";
import { Spinner } from "../ui/spinner";
import { Divider } from "../ui/divider";

export const Option = (props: AutocompleteOption & { itemMaxHeight?: number }) => {
  const { id: key, label, thumbnail, hasThumbnail, avatarProps, href, itemMaxHeight } = props;
  const labelString = typeof label === "string" ? label : "";

  const getContent = () => {
    return (
      <HStack space="md">
        {avatarProps && <ProfileAvatar size="sm" {...avatarProps} />}

        {hasThumbnail && !avatarProps && (
          <Box
            className="items-center justify-center"
            style={{ width: 70, aspectRatio: 2 / 3 }}
          >
            {thumbnail ? (
              <Image
                size="xs"
                source={{ uri: thumbnail }}
                alt={labelString}
                className="w-full h-full"
              />
            ) : (
              <BookOpen size={24} color="#94a3b8" />
            )}
          </Box>
        )}
        <Box className="flex-1 h-full">
          <Box className="flex justify-center pt-1">
            {typeof label === "string" ? <Text>{label}</Text> : label}
          </Box>
        </Box>
      </HStack>
    );
  };

  return (
    <VStack
      key={key}
      className="py-2 px-4 w-full gap-3"
      style={itemMaxHeight ? { maxHeight: itemMaxHeight, overflow: "hidden" } : undefined}
    >
      <HStack className="w-full items-center">
        <Box className="flex-1">
          {href ? <Link href={href}>{getContent()}</Link> : getContent()}
        </Box>
        <Actions {...props} />
      </HStack>
      <Divider />
    </VStack>
  );
};

export const Options = ({
  options,
  isLoading,
  isChanged,
  onViewAll,
  itemMaxHeight,
}: AutocompleteProps & { isChanged: boolean }) => {
  if (isLoading) {
    return <Spinner className="my-4" />;
  }

  if (!options.length && !isLoading && isChanged) {
    return (
      <Box className="p-2 w-full">
        <Text className="text-center">
          No results found. Please try a different search term.
        </Text>
      </Box>
    );
  }

  return (
    <VStack>
      {options.map((option) => (
        <Option key={option.id} {...option} itemMaxHeight={itemMaxHeight} />
      ))}
      {onViewAll && (
        <Button variant="link" className="pb-2" onPress={onViewAll}>
          <ButtonText>View All Results...</ButtonText>
        </Button>
      )}
    </VStack>
  );
};
