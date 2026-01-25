import { describe, expect, it, vi } from "vitest";

vi.mock("mongoose", () => ({ default: { connect: vi.fn() } }));
vi.mock("../logger.js", () => ({
  logger: { error: vi.fn(), info: vi.fn() },
}));

vi.spyOn(process, "exit").mockImplementation((() => undefined) as never);

import { connectDB } from "../config/db.js";
import { logger } from "../logger.js";
import mongoose from "mongoose";

describe("connectDB", () => {
  it("logs error and exits if MONGO_URI is missing", async () => {
    delete process.env.MONGO_URI;

    await connectDB();

    expect(logger.error).toHaveBeenCalledWith(
      expect.stringContaining("Error connecting to MongoDB:"),
      expect.any(Object),
    );
    expect(process.exit).toHaveBeenCalledWith(1);
    expect(mongoose.connect).not.toHaveBeenCalled();
  });
});
