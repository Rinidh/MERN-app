import mongoose from "mongoose";
import { logger } from "../logger.js";

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    logger.info(`Connected to MongoDB : ${conn.connection.host}`);
  } catch (error) {
    logger.error("Error connecting to MongoDB:", error);
    process.exit(1); // any exit code other than 0 means failure
  }
};
