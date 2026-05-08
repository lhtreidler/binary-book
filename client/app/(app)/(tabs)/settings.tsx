import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import { useSession } from "@/session/ctx";

export default function Tab() {
  const { signOut } = useSession();

  return (
    <Box className="flex-1 px-4 py-6">
      <Button action="negative" onPress={signOut}>
        <ButtonText>Sign out</ButtonText>
      </Button>
    </Box>
  );
}
