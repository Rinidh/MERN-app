import { describe, expect, it, vi, beforeEach, Mock } from "vitest";

vi.spyOn(mongoose, "connect");
vi.mock("../logger.js", () => ({
  logger: { error: vi.fn(), info: vi.fn() },
}));

import { connectDB } from "../config/db.js";
import { logger } from "../logger.js";
import mongoose from "mongoose";
import { ConfigurationError } from "../errors/configuration-error.js";

describe("connectDB", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv }; // reset all environment variables eg MONGO_URI, PORT etc that have been altered during tests
  });

  it("throws ConfigurationEror when MONGO_URI is missing", async () => {
    delete process.env.MONGO_URI;

    try {
      await connectDB();
      throw new Error("Test should throw");
    } catch (error) {
      expect(error).toBeInstanceOf(ConfigurationError);
      expect((error as Error).message).toBe(
        "No 'MONGO_URI' found in environment variables",
      );
      expect(mongoose.connect).not.toHaveBeenCalled();
    }
  });

  it("connects to MongoDB and logs success", async () => {
    process.env.MONGO_URI = "mongodb://fake-uri";
    vi.mocked(mongoose.connect as unknown as Mock).mockResolvedValue({
      connection: { host: "localhost" },
    });

    await connectDB();

    expect(mongoose.connect).toHaveBeenCalledWith("mongodb://fake-uri");
    expect(logger.info).toHaveBeenCalledWith(
      expect.stringContaining("Connected to MongoDB"),
    );
    expect(logger.info).toHaveBeenCalledWith(
      expect.stringContaining("localhost"),
    );
  });
});
