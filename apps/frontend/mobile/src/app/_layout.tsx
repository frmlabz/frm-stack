import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { View, Text, StyleSheet } from "react-native";

import { useColorScheme } from "#/hooks/use-color-scheme";
import { ORPCProvider } from "#/providers/orpc-provider";
import { SessionProvider } from "#/providers/session-provider";
import { getConfig } from "#/lib/config";
import { initAuthClient } from "#/lib/auth";

export const unstable_settings = {
  anchor: "(tabs)",
};

function ConfigError({ message }: { message: string }) {
  return (
    <View style={styles.errorContainer}>
      <Text style={styles.errorTitle}>Configuration Error</Text>
      <Text style={styles.errorText}>{message}</Text>
      <Text style={styles.errorHint}>
        Make sure you have a .env file with:{"\n"}
        EXPO_PUBLIC_API_URL{"\n"}
      </Text>
    </View>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  let config;
  try {
    config = getConfig();
  } catch (err) {
    return (
      <ConfigError message={err instanceof Error ? err.message : "Failed to load configuration"} />
    );
  }

  initAuthClient(config.apiUrl);

  return (
    <ORPCProvider apiUrl={config.apiUrl}>
      <SessionProvider>
        <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
          <Stack>
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </SessionProvider>
    </ORPCProvider>
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ff3b30",
    marginBottom: 12,
  },
  errorText: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
    marginBottom: 16,
  },
  errorHint: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    fontFamily: "monospace",
  },
});
