import { Box } from "../ui/box";
import { Image } from "../ui/image";
import { Text } from "../ui/text";
import { AutocompleteOption, AutocompleteProps } from "./types";
import { ProfileAvatar } from "../elements";
import { Link } from "expo-router";
import { Actions } from "./Actions";
import { HStack } from "../ui/hstack";
import { BookOpen } from "lucide-react-native";

const Option = (props: AutocompleteOption) => {
  const { id: key, label, thumbnail, hasThumbnail, avatarProps, href } = props;

  const getContent = () => {
    return (
      <HStack space="md">
        {avatarProps && <ProfileAvatar size="sm" {...avatarProps} />}

        {hasThumbnail && !avatarProps && (
          <Box
            className="bg-slate-200 items-center justify-center"
            style={{ width: 70, aspectRatio: 2 / 3 }}
          >
            {thumbnail ? (
              <Image
                size="xs"
                source={{ uri: thumbnail }}
                alt={label}
                className="w-full h-full"
              />
            ) : (
              <BookOpen size={24} color="#94a3b8" />
            )}
          </Box>
        )}
        <Box className="flex-1 h-full">
          <Box className="flex justify-center pt-1">
            <Text>{label}</Text>
          </Box>
        </Box>
      </HStack>
    );
  };

  return (
    <Box
      key={key}
      className="bg-slate-50 border-gray-700 py-2 px-4 border-b-hairline flex flex-row items-center w-full gap-3"
    >
      <HStack className="w-full items-center">
        <Box className="flex-1">
          {href ? <Link href={href}>{getContent()}</Link> : getContent()}
        </Box>
        <Actions {...props} />
      </HStack>
    </Box>
  );
};

export const Options = ({
  options,
  isLoading,
  isChanged,
}: AutocompleteProps & { isChanged: boolean }) => {
  if (!options.length && !isLoading && isChanged) {
    return (
      <Box className="p-2 w-full">
        <Text className="text-center">
          No results found. Please try a different search term.
        </Text>
      </Box>
    );
  }

  return options.map((option) => <Option key={option.id} {...option} />);
};
