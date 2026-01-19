import { vi } from "vitest";
import type { Model } from "mongoose";
import { ProductDocument } from "./product.model.js";

const saveMock = vi.fn();

const ProductMock = vi.fn().mockImplementation(function () {
  // used function declaration instead of arrow function to allow ProductMock to be callable as a contructor with `new`
  return {
    save: saveMock,
  };
}) as unknown as Model<ProductDocument>; // type casting to allow setting static properties on the mock function
ProductMock.find = vi.fn();
ProductMock.findByIdAndUpdate = vi.fn();
ProductMock.findByIdAndDelete = vi.fn();

export { ProductMock, saveMock };
