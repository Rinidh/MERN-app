import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import productRoutes from "./routes/product.route.js";

dotenv.config();
const PORT = process.env.PORT || 5000;

const app = express();

app.use(express.json()); // Middleware to parse JSON bodies in req.body
app.use("/api/products", productRoutes);

connectDB();
app.listen(PORT, () => {
  console.log("Server is running on port:" + PORT);
});
