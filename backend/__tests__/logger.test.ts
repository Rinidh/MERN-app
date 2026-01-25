import { describe, expect, it, vi } from "vitest";

vi.mock("winston", async () => {
  const actual = await vi.importActual("winston");

  return {
    default: {
      ...actual,
      createLogger: vi.fn(),
      transports: {
        File: vi.fn(),
        Console: vi.fn(),
        MongoDB: vi.fn(),
      },
    },
  };
});

describe("logger", () => {
  it("creates a logger with expected configurations upon import", async () => {
    const winston = await import("winston");
    await import("../logger.js");

    expect(winston.default.createLogger).toHaveBeenCalledOnce();

    const config = vi.mocked(winston.default.createLogger).mock.calls[0][0];
    expect(config).not.toBeUndefined();
    expect(config?.level).toBe("info");
    expect((config?.transports as any[]).length).toBe(3);
    expect(config?.exceptionHandlers?.length).toBe(2);
    expect(config?.rejectionHandlers?.length).toBe(2);
  });
});
