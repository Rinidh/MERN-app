import { describe, vi, expect, it, afterEach, beforeEach } from "vitest";
import request from "supertest";

vi.mock("../config/db.js", () => ({
  connectDB: vi.fn().mockResolvedValue(null),
}));
vi.mock("../logger.js", () => ({
  logger: { error: vi.fn(), info: vi.fn() },
  initMongoDBLogger: vi.fn(),
}));

import { connectDB } from "../config/db.js";
import { logger } from "../logger.js";

describe("Server bootstrap", () => {
  afterEach(() => {
    vi.resetModules();
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
  });
});
