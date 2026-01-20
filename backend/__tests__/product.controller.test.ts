import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Request, Response } from "express";
import { saveMock, ProductMock } from "../models/product.model.mock.js";

import {
  createProduct,
  deleteProduct,
  getAllProducts,
  updateProduct,
} from "../controllers/product.controller.js";

import Product from "../models/product.model.js";
import { logger } from "../logger.js";
import mongoose from "mongoose";

// MOCKS
vi.mock("../models/product.model.js", () => ({
  default: ProductMock,
}));

vi.mock("../logger.js", () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
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
      expect.objectContaining({ message: expect.any(String) }),
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
      expect.objectContaining({ message: expect.any(String) }),
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
      expect.objectContaining({ message: expect.any(String) }),
    );
  });

  it("creates new product and returns 201 with data and message", async () => {
    const createdProduct = {
      _id: "mock-id",
      name: "valid name",
      price: 10,
      image: "valid image url",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const req = {
      body: { name: "valid name", image: "valid image url", price: 10 },
    } as Request;
    const res = mockResponse();

    vi.mocked(saveMock).mockResolvedValue(createdProduct);

    await createProduct(req, res);

    expect(ProductMock).toHaveBeenCalled();
    expect(saveMock).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        data: createdProduct,
        message: expect.any(String),
      }),
    );
  });

  it("returns 500 with message on db error", async () => {
    const req = {
      body: { name: "valid name", image: "valid image url", price: 10 },
    } as Request;
    const res = mockResponse();

    vi.mocked(saveMock).mockRejectedValue(new Error("failed to save"));

    await createProduct(req, res);

    expect(logger.error).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.any(String),
      }),
    );
  });
});

describe("updateProduct", () => {
  beforeEach(() => {
    vi.spyOn(mongoose, "isValidObjectId").mockReturnValue(true);
  });

  it("returns 404 for invalid id", async () => {
    vi.spyOn(mongoose, "isValidObjectId").mockReturnValue(false);

    const req = {
      params: { id: "invalid-id" },
      body: { name: "valid name updated" },
    } as Request<{ id: string }>;
    const res = mockResponse();

    await updateProduct(req, res);

    expect(logger.warn).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.any(String) }),
    );
  });

  it("returns 400 with message if no fields supplied to update", async () => {
    const req = {
      params: { id: "valid-id" },
      body: {},
    } as Request<{ id: string }>;
    const res = mockResponse();

    await updateProduct(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.any(String) }),
    );
  });

  it("updates product and returns 200 with updated product and message", async () => {
    const req = {
      params: { id: "valid-id" },
      body: { name: "valid name updated" },
    } as Request<{ id: string }>;
    const res = mockResponse();

    const updatedProduct = {
      _id: "valid-id",
      name: "valid name updated",
      price: 10,
      image: "valid image url",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    vi.mocked(Product.findByIdAndUpdate).mockResolvedValue(updatedProduct); /// try direct Product.findByIdAndUpdate.mockImplementation...

    await updateProduct(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.any(String),
        data: updatedProduct,
      }),
    );
  });

  it("returns 500 when db error", async () => {
    const req = {
      params: { id: "valid-id" },
      body: { name: "valid name updated" },
    } as Request<{ id: string }>;
    const res = mockResponse();

    vi.mocked(Product.findByIdAndUpdate).mockRejectedValue(
      new Error("failed to update"),
    );

    await updateProduct(req, res);

    expect(logger.error).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.any(String),
      }),
    );
  });
});

describe("deleteProduct", () => {
  beforeEach(() => {
    vi.spyOn(mongoose, "isValidObjectId").mockReturnValue(true);
  });

  it("fails with 404 and a message if invalid ID supplied", async () => {
    const req = {
      params: { id: "invalid-id" },
    } as Request<{ id: string }>;
    const res = mockResponse();

    vi.spyOn(mongoose, "isValidObjectId").mockReturnValue(false);

    await deleteProduct(req, res);

    expect(logger.warn).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.any(String) }),
    );
  });

  it("deletes product and responds with 200 and message", async () => {
    const req = {
      params: { id: "valid-id" },
    } as Request<{ id: string }>;
    const res = mockResponse();

    vi.mocked(Product.findByIdAndDelete).mockResolvedValue(null);

    await deleteProduct(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.any(String) }),
    );
  });

  it("returns 500 with message if db error", async () => {
    const req = {
      params: { id: "valid-id" },
    } as Request<{ id: string }>;
    const res = mockResponse();

    vi.mocked(Product.findByIdAndDelete).mockRejectedValue(
      new Error("failed to delete"),
    );

    await deleteProduct(req, res);

    expect(logger.error).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.any(String) }),
    );
  });
});
