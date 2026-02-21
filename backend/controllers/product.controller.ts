import mongoose from "mongoose";
import { Request, Response } from "express";

import Product, {
  Product as ProductPayload,
  ProductDocument,
} from "../models/product.model.js";
import { BadRequestError } from "../errors/bad-request-error.js";
import { ValidationError } from "../errors/validation-error.js";
import { DocumentCastError } from "../errors/document-cast-error.js";
import { NotFoundError } from "../errors/not-found-error.js";

/**
 * GET /api/products
 */
export const getAllProducts = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  const products: ProductDocument[] = await Product.find({});

  res.status(200).json({ data: products });
};

/**
 * POST /api/products
 */
export const createProduct = async (
  req: Request<{}, {}, ProductPayload>,
  res: Response,
): Promise<void> => {
  const { name, price, image } = req.body;

  if (!name?.trim() || !image?.trim() || price == null)
    throw new BadRequestError("Please fill in all fields.");

  const numPrice = Number(price);
  if (Number.isNaN(numPrice) || numPrice <= 0)
    throw new ValidationError("Price must be a valid number.");

  const newProduct = new Product({
    name: name.trim(),
    price: numPrice,
    image: image.trim(),
  });
  const savedProduct = await newProduct.save();
  res
    .status(201)
    .json({ data: savedProduct, message: "Product created successfully" });
};

/**
 * PUT /api/products/:id
 */
export const updateProduct = async (
  req: Request<{ id: string }, {}, Partial<ProductPayload>>,
  res: Response,
): Promise<void> => {
  const productId = req.params.id;
  const fields = req.body;

  if (!mongoose.isValidObjectId(productId))
    throw new DocumentCastError("Invalid product ID", productId);

  if (Object.keys(fields).length === 0)
    throw new BadRequestError("At least one field is required to update");

  const updatedProduct = await Product.findByIdAndUpdate(productId, fields, {
    new: true,
    runValidators: true,
  }).orFail(new NotFoundError("No product found"));

  res
    .status(200)
    .json({ data: updatedProduct, message: "Product updated successfully" });
};

/**
 * DELETE /api/products/:id
 */
export const deleteProduct = async (
  req: Request<{ id: string }>,
  res: Response,
): Promise<void> => {
  const productId = req.params.id;

  if (!mongoose.isValidObjectId(productId))
    throw new DocumentCastError("Invalid product ID", productId);

  await Product.findByIdAndDelete(productId).orFail(
    new NotFoundError("No product found"),
  );

  res.status(200).json({ message: "Product deleted successfully" });
};
