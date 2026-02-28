import { vi, describe, it, expect } from "vitest";
import request from "supertest";
import { ProductMock } from "../models/product.model.mock.js";

vi.mock("../models/product.model.js", () => ({ default: ProductMock }));
vi.mock("../config/db.js");
vi.mock("../logger.js");

import { app } from "../server.js";

describe("requireJson", () => {
  it("allows through requests with application/json header", async () => {
    const res = await request(app).post("/api/products").send({
      name: "Product A",
      price: 10,
      image: "img.jpg",
    });

    expect(res.status).not.toBe(415);
    expect(res.body.message).not.toMatch(/application\/json/i);
  });

  it("blocks requests without application/json header and responds with 415 and message", async () => {
    const res = await request(app)
      .post("/api/products")
      .set("Content-Type", "application/xml")
      .send("<p>Data as XML<p>");

    expect(res.status).toBe(415);
    expect(res.body.errors[0].message).toMatch(/application\/json/i);
  });
});
