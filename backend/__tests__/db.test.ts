import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

vi.mock("mongoose", () => ({ default: { connect: vi.fn() } }));
vi.mock("../logger.js", () => ({
  logger: { error: vi.fn(), info: vi.fn() },
}));

vi.spyOn(process, "exit").mockImplementation((() => undefined) as never);

import { connectDB } from "../config/db.js";
import { logger } from "../logger.js";
import mongoose from "mongoose";

describe("connectDB", () => {
  let exitSpy: ReturnType<typeof vi.spyOn>;
  const originalEnv = process.env;

  beforeEach(() => {
    exitSpy = vi
      .spyOn(process, "exit")
      .mockImplementation((() => undefined) as never);
    vi.clearAllMocks();
    process.env = { ...originalEnv }; // reset all environment variables eg MONGO_URI, PORT etc that have been altered during tests
  });

  afterEach(() => {
    exitSpy.mockRestore(); // restore original process.exit to reset global state then spy again before a new test
  });

  it("logs error and exits if MONGO_URI is missing", async () => {
    delete process.env.MONGO_URI;

    await connectDB();

    expect(logger.error).toHaveBeenCalledWith(
      expect.stringContaining("Error connecting to MongoDB:"),
      expect.any(Object),
    );
    expect(exitSpy).toHaveBeenCalledWith(1);
    expect(mongoose.connect).not.toHaveBeenCalled();
  });

  it("connects to MongoDB and logs success", async () => {
    process.env.MONGO_URI = "mongodb://fake-uri";
    vi.mocked(mongoose.connect).mockResolvedValue({
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
    expect(exitSpy).not.toHaveBeenCalled();
  });
});
