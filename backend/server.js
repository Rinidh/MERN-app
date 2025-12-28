import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import productRoutes from "./routes/product.route.js";
import path from "path";

dotenv.config();
const PORT = process.env.PORT || 5000;

const app = express();

app.use(express.json()); // Middleware to parse JSON bodies in req.body
app.use("/api/products", productRoutes);

if (process.env.NODE_ENV === "production") {
  const __dirname = path.resolve(); // get the path to the root

  app.use(express.static(path.join(__dirname, "/frontend/dist"))); // serve all contents of frontend/ as a static assets stored in dist/ folder
  app.get("*", (req, res, next) => {
    // any endpoint visited at this domain (localhost:5000 or custom domain) apart from /api/products will serve the html file hence the react app
    res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
  });
}

connectDB();
app.listen(PORT, () => {
  console.log("Server is running on port:" + PORT);
});
