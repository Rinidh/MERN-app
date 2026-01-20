import { vi } from "vitest";
import type { Model, ModifyResult, Query } from "mongoose";
import { ProductDocument } from "./product.model.js";

const saveMock = vi.fn();
const updateOrFailMock = vi.fn();
const deleteOrFailMock = vi.fn();

const ProductMock = vi.fn().mockImplementation(function () {
  // used function declaration instead of arrow function to allow ProductMock to be callable as a contructor with `new`
  return {
    save: saveMock,
  };
}) as unknown as Model<ProductDocument>; // type casting to allow setting static properties on the mock function
ProductMock.find = vi.fn();
ProductMock.findByIdAndUpdate = vi.fn(() => ({ orFail: updateOrFailMock })); // remaining to fix type errors
ProductMock.findByIdAndDelete = vi.fn(() => ({ orFail: deleteOrFailMock })); // remaining to fix type errors

export { ProductMock, saveMock, updateOrFailMock, deleteOrFailMock };
