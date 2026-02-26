import { describe, it, expect, vi, beforeEach } from "vitest";
import { createLogger, type Logger, type LoggerConfig } from "#log";

vi.mock("pino", () => ({
  pino: vi.fn(() => ({
    info: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  })),
}));

import { pino } from "pino";

describe("createLogger", () => {
  let logger: Logger;
  let mockPino: {
    info: ReturnType<typeof vi.fn>;
    debug: ReturnType<typeof vi.fn>;
    warn: ReturnType<typeof vi.fn>;
    error: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockPino = {
      info: vi.fn(),
      debug: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    };
    vi.mocked(pino).mockReturnValue(mockPino as never);
  });

  describe("log level configuration", () => {
    it("should set debug level in dev environment", () => {
      const config: LoggerConfig = { env: "dev" };
      createLogger(config);
      expect(pino).toHaveBeenCalledWith({ level: "debug" });
    });

    it("should set info level in non-dev environment", () => {
      const config: LoggerConfig = { env: "production" };
      createLogger(config);
      expect(pino).toHaveBeenCalledWith({ level: "info" });
    });
  });

  describe("logging methods", () => {
    beforeEach(() => {
      logger = createLogger({ env: "test" });
    });

    it("should log info messages", () => {
      logger.info("test message", { userId: 123 });
      expect(mockPino.info).toHaveBeenCalledWith({ userId: 123 }, "test message");
    });

    it("should log debug messages", () => {
      logger.debug("debug message", { debug: true });
      expect(mockPino.debug).toHaveBeenCalledWith({ debug: true }, "debug message");
    });

    it("should log warn messages", () => {
      logger.warn("warning message", { level: "high" });
      expect(mockPino.warn).toHaveBeenCalledWith({ level: "high" }, "warning message");
    });

    it("should log error messages with Error object", () => {
      const error = new Error("test error");
      logger.error("error occurred", error, { context: "test" });

      expect(mockPino.error).toHaveBeenCalledWith(
        {
          context: "test",
          error: {
            message: "test error",
            stack: error.stack,
            name: "Error",
          },
        },
        "error occurred",
      );
    });

    it("should log error messages with non-Error object", () => {
      const errorObj = { code: "ERR_001", details: "Something went wrong" };
      logger.error("error occurred", errorObj, { context: "test" });

      expect(mockPino.error).toHaveBeenCalledWith(
        {
          context: "test",
          error: errorObj,
        },
        "error occurred",
      );
    });

    it("should work without properties", () => {
      logger.info("simple message");
      expect(mockPino.info).toHaveBeenCalledWith({}, "simple message");
    });
  });
});
