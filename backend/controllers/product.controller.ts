import mongoose from "mongoose";
import { Request, Response } from "express";

import Product, {
  Product as ProductPayload,
  ProductDocument,
} from "../models/product.model.js";
import { logger } from "../logger.js";

/**
 * GET /api/products
 */
export const getAllProducts = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  try {
    const products: ProductDocument[] = await Product.find({});
    res.status(200).json({ data: products });
  } catch (error: unknown) {
    logger.error("Error fetching products:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

/**
 * POST /api/products
 */
export const createProduct = async (
  req: Request<{}, {}, ProductPayload>,
  res: Response,
): Promise<void> => {
  const { name, price, image } = req.body;

  if (!name?.trim() || !image?.trim() || price == null) {
    res.status(400).json({ message: "Please fill in all fields." });
    return;
  }

  const numPrice = Number(price);
  if (Number.isNaN(numPrice) || numPrice <= 0) {
    res.status(400).json({ message: "Price must be a valid number." });
    return;
  }

  try {
    const newProduct = new Product({
      name: name.trim(),
      price: numPrice,
      image: image.trim(),
    });
    const savedProduct = await newProduct.save();
    res
      .status(201)
      .json({ data: savedProduct, message: "Product created successfully" });
  } catch (error: unknown) {
    logger.error("Error creating product:", error);
    res.status(500).json({ message: "Internal server Error" });
  }
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

  if (!mongoose.isValidObjectId(productId)) {
    logger.warn("Invalid mongo ID detected: ", productId);
    res.status(404).json({ message: "Invalid product ID" });
    return;
  }

  if (Object.keys(fields).length === 0) {
    res.status(400).json({
      message: "At least one field is required to update",
    });
    return;
  }

  try {
    const updatedProduct = await Product.findByIdAndUpdate(productId, fields, {
      new: true,
      runValidators: true,
    }).orFail();
    res
      .status(200)
      .json({ data: updatedProduct, message: "Product updated successfully" });
  } catch (error: unknown) {
    logger.error("Error updating product:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

/**
 * DELETE /api/products/:id
 */
export const deleteProduct = async (
  req: Request<{ id: string }>,
  res: Response,
): Promise<void> => {
  const productId = req.params.id;

  if (!mongoose.isValidObjectId(productId)) {
    logger.warn("Invalid mongo ID detected: ", productId);
    res.status(404).json({ message: "Invalid product ID" });
    return;
  }

  try {
    await Product.findByIdAndDelete(productId).orFail();
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error: unknown) {
    logger.error("Error deleting product:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
