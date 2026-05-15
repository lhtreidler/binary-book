import { AutocompleteOption, icons } from "./types";
import { HStack } from "../ui/hstack";
import { Button, ButtonIcon } from "../ui/button";

export const Actions = ({
  hideAction,
  id,
  rightActions,
}: AutocompleteOption) => {
  if (hideAction || !rightActions) return null;

  const actions = Array.isArray(rightActions) ? rightActions : [rightActions];

  return (
    <HStack className="ml-2" space="sm">
      {actions.map(({ icon, isActive, handler }, i) => (
        <Button
          key={icon}
          size="sm"
          className="rounded-full"
          variant={isActive ? "solid" : "outline"}
          onPress={() => handler(id)}
        >
          <ButtonIcon
            key={icon}
            size="sm"
            as={icons[icon]}
            fill={isActive ? "white" : ""}
            stroke={isActive ? "white" : ""}
          />
        </Button>
      ))}
    </HStack>
  );
};
