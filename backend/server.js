import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import productRoutes from "./routes/product.route.js";

dotenv.config();

const app = express();

app.use(express.json()); // Middleware to parse JSON bodies in req.body
app.use("/api/products", productRoutes);

connectDB();
app.listen(5000, () => {
  console.log("Server is running on port 5000");
});
