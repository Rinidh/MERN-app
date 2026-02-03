import { describe, vi, expect, it, beforeAll } from "vitest";
import request from "supertest";

vi.mock("./config/db.js", () => ({
  connectDB: vi.fn().mockResolvedValue(null),
}));
vi.mock("./logger.js", () => ({
  logger: { error: vi.fn(), info: vi.fn() },
  initMongoDBLogger: vi.fn(),
}));

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
  });
});

describe("Server integration - JSON middleware", () => {
  it("returns 415 with message when req.body is not JSON", async () => {
    const res = await request(app)
      .post("/api/products")
      .send("<p>Data as XML<p>")
      .set("Content-Type", "application/xml");

    expect(res.status).toBe(415);
    expect(res.body.message).toEqual(
      expect.stringContaining(
        "Unsupported Media Type. Expected application/json.",
      ),
    );
  });

  it("accepts JSON bodies in requests", async () => {
    const res = await request(app)
      .post("/api/products")
      .send({ name: "valid name", price: 10, image: "valid image url" })
      .set("Content-Type", "application/json");

    expect(res.status).not.toBe(415);
  });
});

describe("Server integration - unknown routes (non-production)", () => {
  it("returns 404 for unknown routes", async () => {
    const response = await request(app).get("/non-existent-route");

    expect(response.status).toBe(404);
  });
});
