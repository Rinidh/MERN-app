import { describe, it, vi, expect, beforeEach } from "vitest";
import express from "express";
import type { Express } from "express";
import request from "supertest";
import router from "../routes/product.route.js";
import {
  createProduct,
  deleteProduct,
  getAllProducts,
  updateProduct,
} from "../controllers/product.controller.js";

vi.mock("../controllers/product.controller.js", () => ({
  getAllProducts: vi.fn((req, res) => {
    res.status(200).json({ message: "getAllProducts was called" });
  }),
  createProduct: vi.fn((req, res) => {
    res.status(201).json({ message: "createProduct was called" });
  }),
  updateProduct: vi.fn((req, res) => {
    res.status(200).json({ message: "updateProduct was called" });
  }),
  deleteProduct: vi.fn((req, res) => {
    res.status(200).json({ message: "deleteProduct was called" });
  }),
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

    expect(response.status).toEqual(200);
    expect(response.body).toEqual(
      expect.objectContaining({ message: "getAllProducts was called" }),
    );
    expect(getAllProducts).toHaveBeenCalledOnce();
  });

  it("POST /api/products calls createProduct", async () => {
    const response = await request(app)
      .post("/api/products")
      .send({ name: "valid name", price: 10, image: "valid image url" });

    expect(response.status).toEqual(201);
    expect(response.body).toEqual(
      expect.objectContaining({ message: "createProduct was called" }),
    );
    expect(createProduct).toHaveBeenCalledOnce();
  });

  it("PUT '/api/products/:id' calls updateProduct", async () => {
    const response = await request(app)
      .put("/api/products/123")
      .send({ name: "updated name" });

    expect(response.status).toEqual(200);
    expect(response.body).toEqual(
      expect.objectContaining({ message: "updateProduct was called" }),
    );
    expect(updateProduct).toHaveBeenCalledOnce();

    // verify if id param was forwarded in 'req' object passed to controller as 1st arg
    const reqObject = vi.mocked(updateProduct).mock.calls[0][0]; // the 1st arg of the recent call above
    const id = reqObject.params.id;
    expect(id).toEqual("123");
  });

  it("DELETE '/api/products/:id' calls deleteProduct", async () => {
    const response = await request(app).delete("/api/products/789");

    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.objectContaining({ message: "deleteProduct was called" }),
    );
    expect(deleteProduct).toHaveBeenCalledOnce();

    const reqObject = vi.mocked(deleteProduct).mock.calls[0][0];
    const id = reqObject.params.id;
    expect(id).toBe("789");
  });
});
