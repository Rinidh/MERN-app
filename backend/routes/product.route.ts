import express from "express";
import {
  createProduct,
  deleteProduct,
  getAllProducts,
  updateProduct,
} from "../controllers/product.controller.js";
import { requireJson } from "../middleware/requireJson.js";

const router = express.Router();

/**
 * Endpoint: /api/products
 */
router.get("/", getAllProducts);
router.post("/", requireJson, createProduct);
router.put("/:id", requireJson, updateProduct);
router.delete("/:id", deleteProduct);

export default router;
