import { router } from "expo-router";
import { StyleSheet, Text, TextInput, View } from "react-native";

import { useSession } from "@/session/ctx";
import { Button } from "@react-navigation/elements";

export default function SignIn() {
  const { signIn } = useSession();
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text
        onPress={() => {
          signIn();
          // Navigate after signing in. You may want to tweak this to ensure sign-in is successful before navigating.
          router.replace("/");
        }}
      >
        Sign In
      </Text>
      <Text>Username</Text>
      <TextInput style={styles.input} />
      <Text>Password</Text>
      <TextInput style={styles.input} />
      <Button>Log In</Button>
      <Button>Sign Up</Button>
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
    width: "90%",
  },
});
