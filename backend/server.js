import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import Product from "./models/product.model.js";

dotenv.config();

const app = express();

app.use(express.json()); // Middleware to parse JSON bodies in req.body

app.post("/api/products", async (req, res) => {
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

app.delete("/api/products/:id", async (req, res) => {
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

connectDB();
app.listen(5000, () => {
  console.log("Server is running on port 5000");
});
