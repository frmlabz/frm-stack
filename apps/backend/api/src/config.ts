import { dbConfigSchema } from "@yourcompany/backend-core/config";
import { z } from "zod";

const apiConfigSchema = z.object({
  env: z.enum(["dev", "production", "test", "staging"]),
  db: dbConfigSchema,
  port: z.number().min(3000).max(65535),
  version: z.string().min(1, "VERSION is required").default("dev"),
  requestLogging: z.boolean().optional().default(false),
  baseServiceUrl: z.string().min(1, "BASE_SERVICE_URL is required"),
  trustedOrigins: z.array(z.string()).min(1, "TRUSTED_ORIGINS is required"),
  cors: z.object({
    origins: z.array(z.string()).min(1, "CORS_ORIGINS is required"),
  }),
  auth: z.object({
    baseUrl: z.string().min(1, "AUTH_BASE_URL is required"),
    google: z
      .object({
        clientId: z.string().min(1, "GOOGLE_CLIENT_ID is required"),
        clientSecret: z.string().min(1, "GOOGLE_CLIENT_SECRET is required"),
      })
      .optional(),
  }),
});

export type ApiConfig = z.infer<typeof apiConfigSchema>;
export { apiConfigSchema };

// Port resolution: API_PORT (from .env.ports) > PORT (from .env) > 8080
const apiPort = Number(process.env.API_PORT || process.env.PORT || 8080);
const pgPort = Number(process.env.PG_PORT || 5432);
const webPort = process.env.WEB_PORT || "4000";
const baseServiceUrl = process.env.BASE_SERVICE_URL || `http://localhost:${apiPort}`;
const webOrigin = `http://localhost:${webPort}`;

export const appConfig = apiConfigSchema.parse({
  port: apiPort,
  version: process.env.VERSION,
  env: process.env.ENVIRONMENT,
  requestLogging: process.env.REQUEST_LOGGING === "true",
  db: {
    host: process.env.PG_HOST,
    user: process.env.PG_USER,
    password: process.env.PG_PASS,
    name: process.env.PG_DB,
    port: pgPort,
  },
  baseServiceUrl,
  cors: {
    origins: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(",") : [webOrigin],
  },
  auth: {
    baseUrl: baseServiceUrl,
    google:
      process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
        ? {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }
        : undefined,
  },
  trustedOrigins: process.env.TRUSTED_ORIGINS ? process.env.TRUSTED_ORIGINS.split(",") : [webOrigin, "mobile://"],
});

export const isDev = appConfig.env === "dev";
