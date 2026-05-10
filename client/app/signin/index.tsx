import { Button, ButtonText } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { View } from "react-native";
import { useRouter } from "expo-router";
import { Center } from "@/components/ui/center";

export default function SignIn() {
  const router = useRouter();

  return (
    <View>
      <Center className="w-full h-3/4">
        <VStack space="4xl" className="w-full p-8">
          <Text size="2xl" bold className="text-center">
            Welcome to Binary Book
          </Text>
          <VStack space="lg">
            <Button action="primary">
              <ButtonText onPress={() => router.navigate("/signin/login")}>
                Log in
              </ButtonText>
            </Button>
            <Button action="secondary">
              <ButtonText onPress={() => router.navigate("/signin/signup")}>
                Create an Account
              </ButtonText>
            </Button>
          </VStack>
        </VStack>
      </Center>
    </View>
  );
}
