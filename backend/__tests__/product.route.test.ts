import { describe, it, vi, expect, beforeEach } from "vitest";
import express from "express";
import type { Express } from "express";
import request from "supertest";
import router from "../routes/product.route.js";
import {
  createProduct,
  getAllProducts,
} from "../controllers/product.controller.js";

vi.mock("../controllers/product.controller.js", () => ({
  getAllProducts: vi.fn((req, res) => {
    res.status(200).json({ message: "getAllProducts was called" });
  }),
  createProduct: vi.fn((req, res) => {
    res.status(201).json({ message: "createProduct was called" });
  }),
  updateProduct: vi.fn(),
  deleteProduct: vi.fn(),
}));

describe("product routes", () => {
  let app: Express;

  beforeEach(() => {
    app = express(); // new app before each test to clear express internal state eg if a test may pollute the req, res objects
    app.use("/api/products", router);
    vi.clearAllMocks();
  });

  it("GET /api/products calls getAllProducts", async () => {
    const response = await request(app).get("/api/products");

    expect(getAllProducts).toHaveBeenCalledOnce();
    expect(response.status).toEqual(200);
    expect(response.body).toEqual(
      expect.objectContaining({ message: "getAllProducts was called" }),
    );
  });

  it("POST /api/products calls createProduct", async () => {
    const response = await request(app)
      .post("/api/products")
      .send({ name: "valid name", price: 10, image: "valid image url" });

    expect(createProduct).toHaveBeenCalledOnce();
    expect(response.status).toEqual(201);
    expect(response.body).toEqual(
      expect.objectContaining({ message: "createProduct was called" }),
    );
  });
});
