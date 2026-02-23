import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { Request, Response } from "express";
import {
  saveMock,
  ProductMock,
  deleteOrFailMock,
  updateOrFailMock,
} from "../models/product.model.mock.js";

import {
  createProduct,
  deleteProduct,
  getAllProducts,
  updateProduct,
} from "../controllers/product.controller.js";

import Product from "../models/product.model.js";
import { logger } from "../logger.js";
import mongoose from "mongoose";
import { BadRequestError } from "../errors/bad-request-error.js";
import { ValidationError } from "../errors/validation-error.js";
import { DocumentCastError } from "../errors/document-cast-error.js";

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

// HELPERS
const createRes = (): Response => {
  const res = {} as Response;
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

type ExpectedJson = {
  message: string;
  data: unknown;
};

const expectResponse = (res: Response, statusCode: number, data: unknown) => {
  let resJsonObject: ExpectedJson = { data, message: expect.any(String) };

  expect(res.status).toHaveBeenCalledWith(statusCode);
  expect(res.json).toHaveBeenCalledWith(expect.objectContaining(resJsonObject));
};

// GLOBAL SETUP
const isValidObjectIdSpy = vi.spyOn(mongoose, "isValidObjectId");

afterEach(() => {
  vi.clearAllMocks();
});

// TESTS
describe("getAllProducts", () => {
  it("returns 200 and products", async () => {
    const req = {} as Request;
    const res = createRes();

    const mockProducts = [
      { name: "test product name", price: 1, image: "test product image" },
    ];
    vi.mocked(Product.find).mockResolvedValue(mockProducts as any); // did not set mockProducts to type ProductsDocument as it would be required to all props of mongoose.Document to it

    await getAllProducts(req, res);

    expectResponse(res, 200, mockProducts);
  });
});

describe("createProduct", () => {
  it.each([
    ["name", { name: "", price: 10, image: "valid image url" }],
    ["price", { name: "valid name", price: null, image: "valid image url" }],
    ["image", { name: "valid name", price: 15, image: "" }],
  ])(
    "throws BadRequestError with message when %s field is missing",
    async (_, body) => {
      const req = { body } as Request;
      const res = createRes();

      try {
        await createProduct(req, res);
        throw new Error("Test should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestError);
        expect((error as Error).message).toBe("Please fill in all fields.");
        expect(ProductMock).not.toHaveBeenCalled();
      }
    },
  );

  it.each([
    ["NaN price", "xyz"],
    ["negative  price", -1],
  ])("throws ValidationError with message if price is %s", async (_, price) => {
    const req = {
      body: { name: "valid name", price, image: "valid image url" },
    } as Request;
    const res = createRes();

    try {
      await createProduct(req, res);
      throw new Error("Test should have thrown");
    } catch (error) {
      expect(error).toBeInstanceOf(ValidationError);
      expect((error as Error).message).toBe("Price must be a valid number.");
      expect(ProductMock).not.toHaveBeenCalled();
    }
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
    const res = createRes();

    vi.mocked(saveMock).mockResolvedValue(createdProduct);

    await createProduct(req, res);

    expect(ProductMock).toHaveBeenCalledWith(expect.objectContaining(req.body));
    expect(saveMock).toHaveBeenCalled();
    expectResponse(res, 201, createdProduct);
  });

  // Ensuring MongoServerError, ECONNRESET etc errors are thrown is responsibility of mongoose and MongoDB driver
});

describe("updateProduct", () => {
  beforeEach(() => {
    isValidObjectIdSpy.mockReturnValue(true);
  });

  it("throws DocumentCastError with message and id if invalid id", async () => {
    isValidObjectIdSpy.mockReturnValue(false);

    const req = {
      params: { id: "invalid-id" },
      body: { name: "valid name updated" },
    } as Request<{ id: string }>;
    const res = createRes();

    try {
      await updateProduct(req, res);
      throw new Error("Test should throw");
    } catch (error) {
      expect(error).toBeInstanceOf(DocumentCastError);
      expect((error as Error).message).toBe("Invalid product ID");
      expect((error as any).invalidMongoId).toBe(expect.any(String));
      expect(updateOrFailMock).not.toHaveBeenCalled();
    }
  });

  it("throws BadRequestError with message if no fields to update", async () => {
    const req = {
      params: { id: "valid-id" },
      body: {},
    } as Request<{ id: string }>;
    const res = createRes();

    try {
      await updateProduct(req, res);
      throw new Error("Test should throw");
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestError);
      expect(updateOrFailMock).not.toHaveBeenCalled();
    }
  });

  it("updates product and returns 200 with updated product and message", async () => {
    const req = {
      params: { id: "valid-id" },
      body: { name: "name updated" },
    } as Request<{ id: string }>;
    const res = createRes();

    const updatedProduct = {
      _id: "valid-id",
      name: "name updated",
      price: 10,
      image: "valid image url",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    vi.mocked(updateOrFailMock).mockResolvedValue(updatedProduct); /// try direct Product.findByIdAndUpdate.mockImplementation...

    await updateProduct(req, res);

    expectResponse(res, 200, updatedProduct);
    expect(updateOrFailMock).toHaveBeenCalledOnce();
  });

  // ensuring (hence testing) that an error is thrown by .orFail() when Product.findByIdAndUpdate() returns null is responsibility of mongoose
});

describe("deleteProduct", () => {
  beforeEach(() => {
    isValidObjectIdSpy.mockReturnValue(true);
  });

  it("fails with 400 and a message if invalid ID supplied", async () => {
    const req = {
      params: { id: "invalid-id" },
    } as Request<{ id: string }>;
    const res = createRes();

    isValidObjectIdSpy.mockReturnValue(false);

    await deleteProduct(req, res);

    expect(logger.warn).toHaveBeenCalled();
    expectResponse(res, 400);
    expect(deleteOrFailMock).not.toHaveBeenCalled();
  });

  it("deletes product and responds with 200 and message", async () => {
    const req = {
      params: { id: "valid-id" },
    } as Request<{ id: string }>;
    const res = createRes();

    vi.mocked(deleteOrFailMock).mockResolvedValue(null);

    await deleteProduct(req, res);

    expectResponse(res, 200);
  });

  it("returns 500 with message if db error", async () => {
    const req = {
      params: { id: "valid-id" },
    } as Request<{ id: string }>;
    const res = createRes();

    vi.mocked(deleteOrFailMock).mockRejectedValue(
      new Error("failed to delete"),
    );

    await deleteProduct(req, res);

    expect(logger.error).toHaveBeenCalled();
    expectResponse(res, 500);
  });
});
