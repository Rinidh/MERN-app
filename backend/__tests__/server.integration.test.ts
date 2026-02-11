import { describe, vi, expect, it, afterEach } from "vitest";
import request from "supertest";

vi.mock("../config/db.js", () => ({
  connectDB: vi.fn().mockResolvedValue(null),
}));
vi.mock("../logger.js", () => ({
  logger: { error: vi.fn(), info: vi.fn() },
  initMongoDBLogger: vi.fn(),
}));

import { app } from "../server.js";
import { beforeEach } from "node:test";

describe("Server bootstrap", () => {
  let originalEnv = process.env.NODE_ENV;

  beforeEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  afterEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
  });

  it("app does not start listening when NODE_ENV=test", async () => {
    process.env.NODE_ENV = "test";

    const { connectDB } = await import("../config/db.js");

    await import("../server.js");

    expect(connectDB).not.toHaveBeenCalled();
  });
});

describe("Server integration - unknown routes (non-production)", () => {
  it("returns 404 for unknown routes", async () => {
    const response = await request(app).get("/non-existent-route");

    expect(response.status).toBe(404);
  });
});
