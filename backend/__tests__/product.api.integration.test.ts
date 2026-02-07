import { MongoMemoryServer } from "mongodb-memory-server";
import { afterAll, beforeAll, describe, expect, it, afterEach } from "vitest";
import request from "supertest";
import mongoose, { ObjectId } from "mongoose";

import { app } from "../server.js";
import { connectDB } from "../config/db.js";
import Product from "../models/product.model.js";

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

  afterEach(async () => {
    await Product.deleteMany({});
  });

  it("returns 200 with empty array when no products exist", async () => {
    const res = await request(app).get("/api/products");

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(0);
  });

  it("returns 200 with array of products when they exist in DB", async () => {
    await Product.create([
      {
        name: "product A",
        price: 1,
        image: "image A",
      },
      {
        name: "product B",
        price: 2,
        image: "image B",
      },
    ]);

    const res = await request(app).get("/api/products");

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("data");
    expect(res.body.data.length).toBe(2);

    const names = res.body.data.map((p: any) => p.name);
    expect(names[0]).toBe("product A");
    expect(names[1]).toBe("product B");
  });

  it("returns products with the expected fields", async () => {
    const product = await Product.create({
      name: "Product X",
      price: 50,
      image: "image-x.jpg",
    });

    const res = await request(app).get("/api/products");

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);

    const productDoc = res.body.data[0];
    expect(productDoc._id).toBe((product._id as ObjectId).toString());
    expect(productDoc.name).toBe("Product X");
    expect(productDoc.price).toBe(50);
    expect(productDoc.image).toBe("image-x.jpg");
    expect(productDoc).toHaveProperty("createdAt");
    expect(productDoc).toHaveProperty("updatedAt");
  });
});
