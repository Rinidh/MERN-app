import { describe, it, expect, vi } from "vitest";
import type { Request, Response } from "express";

import {
  createProduct,
  getAllProducts,
} from "../controllers/product.controller.js";

import Product from "../models/product.model.js";
import { logger } from "../logger.js";

// MOCKS
vi.mock("../models/product.model.js", () => ({
  default: {
    find: vi.fn(),
    findByIdAndUpdate: vi.fn(),
    findByIdAndDelete: vi.fn(),
  },
}));

vi.mock("../logger.js", () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
  },
}));

const mockResponse = (): Response => {
  const res = {} as Response;
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

// TESTS
describe("getAllProducts", () => {
  it("returns 200 and products", async () => {
    const req = {} as Request;
    const res = mockResponse();

    const mockProducts = [
      { name: "test product name", price: 1, image: "test product image" },
    ];
    vi.mocked(Product.find).mockResolvedValue(mockProducts as any); // did not set mockProducts to type ProductsDocument as it would be required to all props of mongoose.Document to it

    await getAllProducts(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ data: mockProducts });
  });

  it("returns 500 with message on error", async () => {
    const req = {} as Request;
    const res = mockResponse();

    vi.mocked(Product.find).mockRejectedValue(new Error("DB Error"));

    await getAllProducts(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.any(String) })
    );
    expect(logger.error).toHaveBeenCalled();
  });
});

describe("createProduct", () => {
  it.each([
    ["name", { name: "", price: 10, image: "valid image url" }],
    ["price", { name: "valid name", price: null, image: "valid image url" }],
    ["image", { name: "valid name", price: null, image: "" }],
  ])("returns 400 with message when %s field is missing", async (_, body) => {
    const req = { body } as Request;
    const res = mockResponse();

    await createProduct(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.any(String) })
    );
  });

  it.each([
    ["NaN price", "xyz"],
    ["negative  price", -1],
  ])("returns 400 with message if price is %s", async (_, price) => {
    const req = {
      body: { name: "valid name", price, image: "valid image url" },
    } as Request;
    const res = mockResponse();

    await createProduct(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.any(String) })
    );
  });
});
