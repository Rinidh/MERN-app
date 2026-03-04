import { describe, vi, expect, it, afterEach } from "vitest";
import request from "supertest";

vi.mock("../config/db.js", () => ({
  connectDB: vi.fn().mockResolvedValue(null),
}));
vi.mock("../logger.js", () => ({
  logger: { error: vi.fn(), info: vi.fn() },
  initMongoDBLogger: vi.fn(),
}));

import { connectDB } from "../config/db.js";
import { initMongoDBLogger, logger } from "../logger.js";

describe("Server bootstrap", () => {
  afterEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.restoreAllMocks();
    process.env.NODE_ENV = "test";
  });

  it("connects to database, app listens to requests and info message logs when NODE_ENV!=test", async () => {
    process.env.NODE_ENV = "development";

    const { app, startServer } = await import("../server.js");

    const listenSpy = vi
      .spyOn(app, "listen")
      .mockImplementation((_, cb?: () => void) => {
        cb?.(); // to simulate calling logger.info in cb
        return {} as any;
      });

    await startServer();

    expect(listenSpy).toHaveBeenCalledOnce();
    expect(connectDB).toHaveBeenCalledOnce();
    expect(initMongoDBLogger).toHaveBeenCalledOnce();
    expect(logger.info).toHaveBeenCalledWith(
      expect.stringContaining("Server is running on port"),
    );
  });
});

describe("Server integration - unknown routes (non-production)", () => {
  it("returns 404 for unknown routes", async () => {
    const { app } = await import("../server.js");

    const response = await request(app).get("/non-existent-route");

    expect(response.status).toBe(404);
    expect(response.body.errors[0].message).toMatch(/not found/i);
  });

  it("logs error and exits process with status 1 on fatal errors", async () => {
    const error = new Error("DB connection error");
    vi.mocked(connectDB).mockImplementation(() => {
      throw error;
    });
    const exitSpy = vi
      .spyOn(process, "exit")
      .mockImplementation(() => null as never);

    const { startServer } = await import("../server.js");

    startServer();

    const [firstCall, secondCall] = vi.mocked(logger.error).mock.calls;
    expect(firstCall[0]).toBe("⚠️ Failed to start server");
    expect(secondCall[0]).toBe(error);
    expect(exitSpy).toHaveBeenCalledExactlyOnceWith(1);
  });
});
