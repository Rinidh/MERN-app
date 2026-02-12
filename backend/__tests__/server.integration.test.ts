import { describe, vi, expect, it, afterEach, beforeEach } from "vitest";
import request from "supertest";
import express from "express";

vi.mock("../config/db.js", () => ({
  connectDB: vi.fn().mockResolvedValue(null),
}));
vi.mock("../logger.js", () => ({
  logger: { error: vi.fn(), info: vi.fn() },
  initMongoDBLogger: vi.fn(),
}));

import { connectDB } from "../config/db.js";

beforeEach(() => {
  // beforeEach describe() test suite
  process.env.NODE_ENV = "test"; // for readability (node env is also set by Vitest)
});

describe("Server bootstrap", () => {
  afterEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
    process.env.NODE_ENV = "test";
  });
  it("app does not start listening when NODE_ENV=test", async () => {
    await import("../server.js");

    expect(connectDB).not.toHaveBeenCalled();
  });

  it("app does not start listening when NODE_ENV=test", async () => {
    const listenSpy = vi.spyOn(express.application, "listen");

    await import("../server.js");

    expect(listenSpy).not.toHaveBeenCalled();
  });

  it("connects to database, app listens to requests and info message logs when NODE_ENV!=test", async () => {
    process.env.NODE_ENV = "development";

    const listenSpy = vi.spyOn(express.application, "listen");

    await import("../server.js");

    expect(listenSpy).toHaveBeenCalledOnce();
    expect(connectDB).toHaveBeenCalledOnce();
  });
});

describe("Server integration - unknown routes (non-production)", () => {
  it("returns 404 for unknown routes", async () => {
    const { app } = await import("../server.js");

    const response = await request(app).get("/non-existent-route");

    expect(response.status).toBe(404);
  });
});
