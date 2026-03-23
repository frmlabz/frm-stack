import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { useState, useEffect } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";

import { useColorScheme } from "#hooks/use-color-scheme";
import { ORPCProvider } from "#providers/orpc-provider";
import { SessionProvider } from "#providers/session-provider";
import { getConfig, type AppConfig } from "#lib/config";
import { initAuthClient } from "#lib/auth";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      setConfig(getConfig());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load configuration");
    }
  }, []);

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Configuration Error</Text>
        <Text style={styles.errorText}>{error}</Text>
        <Text style={styles.errorHint}>
          Make sure you have a .env file with:{"\n"}
          EXPO_PUBLIC_API_URL{"\n"}
        </Text>
      </View>
    );
  }

  if (!config) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading configuration...</Text>
      </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
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
