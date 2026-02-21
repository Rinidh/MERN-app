import mongoose from "mongoose";
import { logger } from "../logger.js";

if (process.env.NODE_ENV === "test") {
  mongoose.set("bufferCommands", false);
  mongoose.set("bufferTimeoutMS", 0);
}

export const connectDB = async (): Promise<void> => {
  const mongoURI = process.env.MONGO_URI;

  try {
    if (!mongoURI)
      throw new Error("No 'MONGO_URI' found in environment variables");

    const conn = await mongoose.connect(mongoURI);
    logger.info(`Connected to MongoDB : ${conn.connection.host}`);
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.error(`Error connecting to MongoDB: ${error.message}`);
    } else {
      logger.error("Unknown error occurred while connecting to MongoDB");
    }
    logger.error(error);

    process.exit(1);
  }
};
