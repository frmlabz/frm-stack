import { betterAuth, logger } from "better-auth";
import { customSession } from "better-auth/plugins";
import { expo } from "@better-auth/expo";
import type { App } from "#app";
import { appConfig } from "#config";
import { logger as appLogger } from "#log";
import { getAuthConfig, authMiddleware, authHandler } from "@yourcompany/backend-core/auth";
import { getDB } from "@yourcompany/backend-core/db";
import { UserService } from "#services/user";

function createAuthConfig(): ReturnType<typeof betterAuth> {
  const baseConfig = getAuthConfig({
    cookiePrefix: "yourcompany",
    auth: appConfig.auth,
    cors: appConfig.cors,
    logger: appLogger,
  });

  const db = getDB();

  return betterAuth({
    ...baseConfig,
    trustedOrigins:
      appConfig.env !== "dev"
        ? appConfig.trustedOrigins
        : [
            ...appConfig.trustedOrigins,
            ...[
              "exp://*/*", // Trust all Expo development URLs
              "exp://10.0.0.*:*/*", // Trust 10.0.0.x IP range
              "exp://192.168.*.*:*/*", // Trust 192.168.x.x IP range
              "exp://172.*.*.*:*/*", // Trust 172.x.x.x IP range
              "exp://localhost:*/*", // Trust localhost
            ],
          ],
    databaseHooks: {
      user: {
        create: {
          before: async (_user) => {
            //
          },
          after: async (user) => {
            const result = await UserService.onUserCreated(db, logger, { userId: user.id });
            if (result.isErr()) {
              logger.error("Failed to setup user after creation", result.error, {
                userId: user.id,
              });
              throw result.error;
            }
          },
        },
      },
    },
    plugins: [
      expo(),
      customSession(async ({ user, session }) => {
        return {
          user,
          session,
        };
      }),
    ],
  });
}

type AuthInstance = ReturnType<typeof createAuthConfig>;

let authInstance: AuthInstance;

export type Auth = AuthInstance;

export function initAuth(): AuthInstance {
  if (authInstance) {
    return authInstance;
  }

  authInstance = createAuthConfig();
  logger.info("Auth initialized");

  return authInstance;
}

export function getAuth(): AuthInstance {
  if (!authInstance) {
    throw new Error("Auth not initialized. Call initAuth() first.");
  }
  return authInstance;
}

export const registerAuth = (app: App) => {
  const auth = getAuth();

  // Workaround: some Expo/native requests arrive with `expo-origin` but missing/incorrect `origin`.
  // Better Auth relies on `origin` for trusted origin checks, including in `auth.api.getSession()`.
  app.use("*", async (c, next) => {
    const expoOrigin = c.req.header("expo-origin");
    if (expoOrigin && c.req.header("origin") !== expoOrigin) {
      c.req.raw.headers.set("origin", expoOrigin);
    }
    await next();
  });

  app.use("*", authMiddleware(auth));

  app.on(["POST", "GET"], "/api/auth/*", authHandler(auth));
};
