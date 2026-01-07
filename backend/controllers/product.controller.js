import Product from "../models/product.model.js";
import mongoose from "mongoose";
import { logger } from "../logger.js";

export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({});
    res.status(200).json({ data: products });
  } catch (error) {
    logger.error("Error fetching products:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const createProduct = async (req, res) => {
  const { name, price, image } = req.body;

  if (!name?.trim() || !price || !image?.trim()) {
    res.status(400).json({ message: "Please fill in all fields." });
    return;
  }

  const num = Number(price);
  if (Number.isNaN(num) || num <= 0) {
    res.status(400).json({ message: "Price must be a valid number." });
    return;
  }

  try {
    const newProduct = new Product({ name, price, image });
    const savedProduct = await newProduct.save();
    res
      .status(201)
      .json({ data: savedProduct, message: "Product created successfully" });
  } catch (error) {
    logger.error("Error creating product:", error);
    res.status(500).json({ message: "Internal server Error" });
  }
};

export const updateProduct = async (req, res) => {
  const productId = req.params.id;
  const fields = req.body;

  if (!mongoose.isValidObjectId(productId)) {
    logger.warn("Invalid mongo ID detected: ", productId);
    return res.status(404).json({ message: "Invalid product ID" });
  }

  if (Object.keys(fields).length === 0) {
    return res.status(400).json({
      message: "At least one field is required to update",
    });
  }

  try {
    const updatedProduct = await Product.findByIdAndUpdate(productId, fields, {
      new: true,
    });
    res
      .status(200)
      .json({ data: updatedProduct, message: "Product updated successfully" });
  } catch (error) {
    logger.error("Error updating product:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const deleteProduct = async (req, res) => {
  const productId = req.params.id;

  if (!mongoose.isValidObjectId(productId)) {
    logger.warn("Invalid mongo ID detected: ", productId);
    return res.status(404).json({ message: "Invalid product ID" });
  }

  try {
    await Product.findByIdAndDelete(productId);
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    logger.error("Error deleting product:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
