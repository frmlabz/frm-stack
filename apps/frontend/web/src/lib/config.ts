import { logger } from "@yourcompany/web/lib/logger";
import { z } from "zod";

// Define the schema for our configuration
const ConfigSchema = z.object({
  apiUrl: z.string(),
  authUrl: z.string(),
});

// Create a type from the schema
export type AppConfig = z.infer<typeof ConfigSchema>;

// Function to get and validate configuration
export function getConfig(): AppConfig {
  const config = {
    apiUrl: import.meta.env.VITE_API_URL,
    authUrl: import.meta.env.VITE_AUTH_URL,
  };

  logger.debug("config", { config });

  if (!ConfigSchema.safeParse(config).success) {
    throw new Error("Invalid configuration");
  }

  return config as AppConfig;
}
