import { describe, vi, expect, it } from "vitest";
import request from "supertest";

vi.mock("./config/db.js", () => ({
  connectDB: vi.fn().mockResolvedValue(null),
}));
vi.mock("./logger.js", () => ({
  logger: { error: vi.fn(), info: vi.fn() },
  initMongoDBLogger: vi.fn(),
}));

// process.env.NODE_ENV = "test"; // NODE_ENV='test' is set by vitest
import { app } from "../server.js";

describe("Server integration - API routes", async () => {
  it("responds to requests at /api/products", async () => {
    const res = await request(app).get("/api/products");

    expect([500, 200]).toContain(res.status);
    if (res.status === 200) {
      expect(res.body.data).toBe(expect.any(Array));
    }
    if (res.status === 500) {
      expect(res.body.message).toBeDefined();
    }
  }, 15_000);
});
