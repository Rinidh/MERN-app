import express from "express";
import mongoose from "mongoose";
import Product from "../models/product.model.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const products = await Product.find({});
    res.status(200).json({ success: true, data: products });
  } catch (error) {
    console.log("Error fetching products:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

router.post("/", async (req, res) => {
  const fields = req.body;

  if (!fields.name || !fields.price || !fields.image) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required" });
  }

  const { name, price, image } = fields;

  try {
    const newProduct = new Product({ name, price, image });
    const savedProduct = await newProduct.save();
    res.status(201).json({ success: true, data: savedProduct });
  } catch (error) {
    console.log("Error creating product:", error);
    res.status(500).json({ success: false, message: "Internal server Error" });
  }
});

router.put("/:id", async (req, res) => {
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
});

router.delete("/:id", async (req, res) => {
  const productId = req.params.id;

  try {
    await Product.findByIdAndDelete(productId);
    res
      .status(200)
      .json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    console.log("Error deleting product:", error);
    res.status(404).json({ success: false, message: "Product not found" });
  }
});

export default router;
