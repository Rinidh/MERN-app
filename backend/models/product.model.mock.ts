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
ProductMock.findByIdAndUpdate = vi.fn(
  () => ({ orFail: updateOrFailMock } as any), // Mongoose Query types are intentionally erased in unit tests and `any` is inferred here intead of mongoose `<Query>`
);
ProductMock.findByIdAndDelete = vi.fn(
  () => ({ orFail: deleteOrFailMock } as any), // Mongoose Query types are intentionally erased in unit tests and `any` is inferred here intead of mongoose `<Query>`
);

export { ProductMock, saveMock, updateOrFailMock, deleteOrFailMock };
