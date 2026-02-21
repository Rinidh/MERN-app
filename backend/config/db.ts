import mongoose from "mongoose";
import { logger } from "../logger.js";
import { ConfigurationError } from "../errors/configuration-error.js";

if (process.env.NODE_ENV === "test") {
  mongoose.set("bufferCommands", false);
  mongoose.set("bufferTimeoutMS", 0);
}

export const connectDB = async (): Promise<void> => {
  const mongoURI = process.env.MONGO_URI;

  if (!mongoURI)
    throw new ConfigurationError(
      "No 'MONGO_URI' found in environment variables",
    );

  const conn = await mongoose.connect(mongoURI);
  logger.info(`Connected to MongoDB : ${conn.connection.host}`);
};
