import mongoose from "mongoose";
import { logger } from "../logger.js";

export const connectDB = async (): Promise<void> => {
  const mongoURI = process.env.MONGO_URI;

  try {
    if (!mongoURI)
      throw new Error("No 'MONGO_URI' found in environment variables");

    const conn = await mongoose.connect(mongoURI);
    logger.info(`Connected to MongoDB : ${conn.connection.host}`);
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.error(`Error connecting to MongoDB: ${error.message}`, {
        stack: error.stack,
      });
    } else {
      logger.error("Unknown error occurred while connecting to MongoDB");
    }

    process.exit(1);
  }
};
