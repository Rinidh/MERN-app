import "./config/env.js";

import express, { Response, Request, NextFunction } from "express";
import path from "path";
import { fileURLToPath } from "url";
import "express-async-errors";

import { connectDB } from "./config/db.js";
import productRoutes from "./routes/product.route.js";
import { logger, initMongoDBLogger } from "./logger.js";
import { errorHandler } from "./middleware/error.js";
import { NotFoundError } from "./errors/not-found-error.js";

const PORT = Number(process.env.PORT) || 5000;

export const app = express();

app.use(express.json()); // Middleware to parse JSON bodies in req.body
app.use("/api/products", productRoutes);
app.use((req, res, next) => {
  throw new NotFoundError(`❌ Route ${req.originalUrl} not found!`);
});
app.use(errorHandler);

if (process.env.NODE_ENV === "production") {
  const __filename = fileURLToPath(import.meta.url); // __filename is path upto ".../backend/server.ts"
  const __dirname = path.dirname(__filename); // __dirname is path upto ".../backend"

  const frontendDistPath = path.join(__dirname, "..", "..", "/frontend/dist");

  app.use(express.static(frontendDistPath)); // serve all contents of frontend/ as a static assets stored in dist/ folder
  app.get("*", (_req: Request, res: Response, next: NextFunction) => {
    // any endpoint visited at this domain (localhost:5000 or custom domain) apart from /api/products will serve the html file hence the react app
    res.sendFile(path.join(frontendDistPath, "index.html"));
  });
}

export const startServer = async () => {
  try {
    await connectDB();
    initMongoDBLogger();

    return app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    logger.error("Failed to start server", error);
    process.exit(1);
  }
};
