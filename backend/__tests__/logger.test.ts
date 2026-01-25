import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

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
  });

  it("does NOT add MongoDB transport when MONGO_URI is missing", async () => {
    console.log(addMock.mock.calls);
    const { initMongoDBLogger } = await import("../logger.js");

    initMongoDBLogger();

    expect(warnMock).toHaveBeenCalled();
    expect(addMock).not.toHaveBeenCalled();
  });
});
