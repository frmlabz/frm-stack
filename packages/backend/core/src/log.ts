import { pino } from "pino";

export interface LoggerConfig {
  env: string;
}

export interface Logger {
  info(msg: string, properties?: Record<string, unknown>): void;
  debug(msg: string, properties?: Record<string, unknown>): void;
  warn(msg: string, properties?: Record<string, unknown>): void;
  error(msg: string, error: Error | unknown, properties?: Record<string, unknown>): void;
}

export function createLogger(config: LoggerConfig): Logger {
  const log = pino({
    level: config.env === "dev" ? "debug" : "info",
  });

  return {
    info: (msg, properties) => log.info(properties ?? {}, msg),
    debug: (msg, properties) => log.debug(properties ?? {}, msg),
    warn: (msg, properties) => log.warn(properties ?? {}, msg),
    error: (msg, error, properties) => {
      const errorObj =
        error instanceof Error
          ? { error: { message: error.message, stack: error.stack, name: error.name } }
          : { error };
      log.error({ ...properties, ...errorObj }, msg);
    },
  };
}
