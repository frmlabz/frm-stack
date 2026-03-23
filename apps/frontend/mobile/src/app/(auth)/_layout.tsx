import { Stack, Redirect } from "expo-router";
import { useSession } from "#providers/session-provider";
import { View, ActivityIndicator, StyleSheet } from "react-native";

export default function AuthLayout() {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (session) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <Stack>
      <Stack.Screen name="signin" options={{ title: "Sign In" }} />
      <Stack.Screen name="signup" options={{ title: "Sign Up" }} />
    </Stack>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
