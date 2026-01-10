import mongoose, { Document, Model } from "mongoose";

/**
 * Domain shape for product
 */
export interface Product {
  name: string;
  price: number;
  image: string;
}

/**
 * MongoDB document shape
 */
export interface ProductDocument extends Product, Document {
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new mongoose.Schema<ProductDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    image: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true, // MongoDB automatically manage createdAt and updatedAt fields
  }
);

const Product: Model<ProductDocument> =
  mongoose.models.Product || // access from mongoose.model cache if available (prevent OverwriteModelError)
  mongoose.model<ProductDocument>("Product", productSchema);

export default Product;
