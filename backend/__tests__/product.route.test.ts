import { describe, it, vi, expect } from "vitest";
import express from "express";
import request from "supertest";
import router from "../routes/product.route.js";
import { getAllProducts } from "../controllers/product.controller.js";

vi.mock("../controllers/product.controller.js", () => ({
  getAllProducts: vi.fn((req, res) => {
    res.status(200).json({ message: "getAllProducts was called" });
  }),
  createProduct: vi.fn(),
  updateProduct: vi.fn(),
  deleteProduct: vi.fn(),
}));

describe("product routes", () => {
  const app = express();
  // app.use(express.json()); // not needed as supertest already configures this
  app.use("/api/products", router);

  it("GET /api/products calls getAllProducts", async () => {
    const response = await request(app).get("/api/products");

    expect(getAllProducts).toHaveBeenCalledOnce();
    expect(response.status).toEqual(200);
    expect(response.body).toEqual(
      expect.objectContaining({ message: "getAllProducts was called" }),
    );
  });
});
