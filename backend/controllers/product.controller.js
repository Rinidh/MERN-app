import Product from "../models/product.model.js";
import mongoose from "mongoose";

export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({});
    res.status(200).json({ data: products });
  } catch (error) {
    console.log("Error fetching products:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const createProduct = async (req, res) => {
  const { name, price, image } = req.body;

  if (!name?.trim() || !price?.trim() || !image?.trim()) {
    res.status(400).json({ message: "Please fill in all fields." });
    return;
  }

  if (isNaN(price) || Number(price) <= 0) {
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
    console.log("Error creating product:", error);
    res.status(500).json({ success: false, message: "Internal server Error" });
  }
};

export const updateProduct = async (req, res) => {
  const productId = req.params.id;
  const fields = req.body;

  if (!mongoose.isValidObjectId(productId)) {
    return res
      .status(404)
      .json({ success: false, message: "Invalid product ID" });
  }

  if (Object.keys(fields).length === 0) {
    return res.status(400).json({
      success: false,
      message: "At least one field is required to update",
    });
  }

  try {
    const updatedProduct = await Product.findByIdAndUpdate(productId, fields, {
      new: true,
    });
    res.status(200).json({ success: true, data: updatedProduct });
  } catch (error) {
    console.log("Error updating product:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const deleteProduct = async (req, res) => {
  const productId = req.params.id;

  if (!mongoose.isValidObjectId(productId)) {
    return res
      .status(404)
      .json({ success: false, message: "Invalid product ID" });
  }

  try {
    await Product.findByIdAndDelete(productId);
    res
      .status(200)
      .json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    console.log("Error deleting product:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
