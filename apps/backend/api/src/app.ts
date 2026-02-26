import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import type { Auth } from "#auth";
import { appConfig } from "#config";
import { logger } from "#log";

export interface Variables {
  user: Auth["$Infer"]["Session"]["user"] | null;
  session: Auth["$Infer"]["Session"]["session"] | null;
}

export type AppEnv = {
  Variables: Variables;
};

export const createApp = () => {
  const app = new Hono<AppEnv>();

  app.onError((err, c) => {
    logger.error("HTTP request error", err, {
      req: c.req.raw,
    });

    if (err instanceof HTTPException) {
      return err.getResponse();
    }

    return c.json(
      {
        error: "Internal Server Error",
        details: appConfig.env === "dev" ? err.message : undefined,
      },
      500,
    );
  });

  return app;
};

export type App = ReturnType<typeof createApp>;
