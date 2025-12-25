import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import Product from "./models/product.model.js";

dotenv.config();

const app = express();

app.use(express.json()); // Middleware to parse JSON bodies in req.body

app.post("/products", async (req, res) => {
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

connectDB();
app.listen(5000, () => {
  console.log("Server is running on port 5000");
});
