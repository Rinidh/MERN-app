import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { ConfigurationError } from "../errors/configuration-error.js";

const addMock = vi.fn();
const warnMock = vi.fn();

vi.mock("winston", async () => {
  const actual = await vi.importActual("winston");

  return {
    default: {
      ...actual,
      createLogger: vi.fn().mockReturnValue({ add: addMock, warn: warnMock }),
      transports: {
        File: vi.fn(),
        Console: vi.fn(),
        MongoDB: vi.fn(),
      },
    },
  };
});

describe("logger", () => {
  beforeEach(() => {
    vi.resetModules();
    delete process.env.MONGO_URI;
    delete process.env.LOG_LEVEL;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("creates a logger with expected configurations upon import", async () => {
    const winston = await import("winston");
    const { customFormat } = await import("../logger.js");

    expect(winston.default.createLogger).toHaveBeenCalledOnce();

    const config = vi.mocked(winston.default.createLogger).mock.calls[0][0];
    expect(config).not.toBeUndefined();
    expect(config?.level).toBe("info");
    expect((config?.transports as any[]).length).toBe(3);
    expect(config?.exceptionHandlers?.length).toBe(2);
    expect(config?.rejectionHandlers?.length).toBe(2);

    expect(customFormat).toBeDefined();
  }, 1_000);

  it("throws ConfigurationError and does NOT add MongoDB transport when MONGO_URI is missing", async () => {
    const { initMongoDBLogger } = await import("../logger.js");

    try {
      initMongoDBLogger();
      throw new Error("Test should have thrown");
    } catch (error) {
      expect((error as Object).constructor?.name).toBe("ConfigurationError"); // same as `.toBeInstanceOf()` matcher
      expect((error as Error).message).toBe(
        "MongoDB logging not intiated, no MONGO_URI found",
      );
      expect(addMock).not.toHaveBeenCalled();
    }
  });

  it("adds MongoDB transport if MONGO_URI is present", async () => {
    process.env.MONGO_URI = "mongo uri";

    const winston = await import("winston");

    const { initMongoDBLogger } = await import("../logger.js");

    initMongoDBLogger();

    expect(addMock).toHaveBeenCalled();
    expect(winston.default.transports.MongoDB).toHaveBeenCalledWith({
      db: "mongo uri",
      collection: "logs",
      level: process.env.LOG_LEVEL ?? "info",
      tryReconnect: true,
    });
  });

  it("uses LOG_LEVEL env var for MongoDB transport when provided", async () => {
    process.env.MONGO_URI = "mongodb://localhost:27017/test";
    process.env.LOG_LEVEL = "error";

    const winston = await import("winston");
    const { initMongoDBLogger } = await import("../logger.js");

    initMongoDBLogger();

    expect(winston.default.transports.MongoDB).toHaveBeenCalledWith(
      expect.objectContaining({
        level: "error",
      }),
    );
  });
});
