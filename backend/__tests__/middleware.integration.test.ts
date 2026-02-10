import { vi, describe, it, expect } from "vitest";
import request from "supertest";

vi.mock("./config/db.js", () => ({
  connectDB: vi.fn().mockResolvedValue(null),
}));
vi.mock("./logger.js", () => ({
  logger: { error: vi.fn(), info: vi.fn() },
  initMongoDBLogger: vi.fn(),
}));

import { app } from "../server.js";

describe("requireJson", () => {
  it("allows through requests with application/json header", async () => {
    const res = await request(app).post("/api/products").send({
      name: "Product A",
      price: 10,
      image: "img.jpg",
    });
    console.log(res.body);

    expect(res.status).not.toBe(415);
    expect(res.body.message).not.toMatch(/application\/json/i);
  });
});
