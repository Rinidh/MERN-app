import { describe, vi, expect, it, afterEach } from "vitest";
import request from "supertest";
import express from "express";

vi.mock("../config/db.js", () => ({
  connectDB: vi.fn().mockResolvedValue(null),
}));
vi.mock("../logger.js", () => ({
  logger: { error: vi.fn(), info: vi.fn() },
  initMongoDBLogger: vi.fn(),
}));

import { app } from "../server.js";
import { beforeEach } from "node:test";
import { connectDB } from "../config/db.js";

describe("Server bootstrap", () => {
  let originalEnv = process.env.NODE_ENV;

  beforeEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  afterEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
  });

  it("app does not start listening when NODE_ENV=test", async () => {
    process.env.NODE_ENV = "test";

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
    const response = await request(app).get("/non-existent-route");

    expect(response.status).toBe(404);
  });
});
