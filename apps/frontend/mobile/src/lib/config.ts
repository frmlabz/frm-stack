import Constants from "expo-constants";
import { z } from "zod";

const ConfigSchema = z.object({
  apiUrl: z.url("API URL must be a valid URL"),
});

export type AppConfig = z.infer<typeof ConfigSchema>;

export function getConfig(): AppConfig {
  // Read from environment variables (EXPO_PUBLIC_ prefix makes them available in client)
  const config = {
    apiUrl: process.env.EXPO_PUBLIC_API_URL ?? Constants.expoConfig?.extra?.apiUrl ?? "",
  };

  const result = ConfigSchema.safeParse(config);

  if (!result.success) {
    const errors = result.error.issues.map(e => `${e.path.join(".")}: ${e.message}`).join(", ");
    throw new Error(
      `Invalid configuration. Please check your .env file or app.json:\n${errors}\n\n`
    );
  }

  return config;
}
