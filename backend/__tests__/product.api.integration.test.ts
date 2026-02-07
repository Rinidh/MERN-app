import { MongoMemoryServer } from "mongodb-memory-server";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";

import { app } from "../server.js";
import { connectDB } from "../config/db.js";
import mongoose from "mongoose";

let mongoServer: MongoMemoryServer;

describe("GET /api/products - Integration tests", () => {
  beforeAll(async () => {
    process.env.NODE_ENV = "test"; /// try when not set

    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    process.env.MONGO_URI = mongoUri;

    await connectDB();
  });

  afterAll(async () => {
    await mongoose.connection.close();
    await mongoServer.stop();
  });

  it("returns 200 with empty array when no products exist", async () => {
    const res = await request(app).get("/api/products");

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(0);
  });
});
