import { MongoMemoryServer } from "mongodb-memory-server";
import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  afterEach,
  vi,
} from "vitest";
import request from "supertest";
import mongoose, { ObjectId } from "mongoose";

import { app } from "../server.js";
import { connectDB } from "../config/db.js";
import Product, { productSchema } from "../models/product.model.js";

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  process.env.MONGO_URI = mongoUri;

  await connectDB();
  productSchema.index({ name: 1 }, { unique: true }); // add indexes for all values of name field in new docs. Indexes are auto created for field-values declared in mongoose schema with `unique: true` but have to manually redeclare for mongo-memory-server
  await mongoose.connection.syncIndexes();
});

afterAll(async () => {
  await mongoose.connection.close();
  await mongoServer.stop();
});

afterEach(async () => {
  await Product.deleteMany({});
});

describe("GET /api/products - Integration tests", () => {
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

  it("returns 500 if database query fails", async () => {
    await mongoose.connection.close();

    const res = await request(app).get("/api/products");

    expect(res.status).toBe(500);
    expect(res.body.errors[0]).toHaveProperty(
      "message",
      "Internal Server Error",
    );

    await mongoose.connect(process.env.MONGO_URI as string); // reconnect to db for remaining lifecycle and cleanup
  });
});

describe("POST /api/products - Integration tests", () => {
  afterEach(async () => {
    await Product.deleteMany({});
  });

  it("creates a product and returns 201 with product data and message", async () => {
    const payload = {
      name: "New Product",
      price: 150,
      image: "image.jpg",
    };

    const res = await request(app).post("/api/products").send(payload);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("message", "Product created successfully");

    const created = res.body.data;
    expect(created._id).toEqual(expect.any(String));
    expect(created.name).toBe("New Product");
    expect(created.price).toBe(150);
    expect(created.image).toBe("image.jpg");
    expect(created.createdAt).toBeDefined();
    expect(created.updatedAt).toBeDefined();

    const productInDB = await Product.findById(created._id);
    expect(productInDB).not.toBeNull();
    expect(productInDB?.name).toBe(payload.name);
  });

  it("returns 400 with message when required fields are missing", async () => {
    const payload = { name: "product A" };

    const res = await request(app).post("/api/products").send(payload);

    expect(res.status).toBe(400);
    expect(res.body.errors[0].message).toBeDefined();
  });

  it("returns 409 with message when name is already taken", async () => {
    const product = await Product.create({
      name: "same name",
      price: 100,
      image: "img1.jpg",
    });

    const payload = {
      name: "same name",
      price: 200,
      image: "img2.jpg",
    };

    const res = await request(app).post("/api/products").send(payload);

    expect(res.status).toBe(409);
    expect(res.body).toEqual({
      errors: [{ message: "Field value already taken" }],
    });
  });

  it("returns 500 with message when saving product fails", async () => {
    const saveSpy = vi
      .spyOn(Product.prototype, "save")
      .mockImplementationOnce(() => {
        throw new Error("DB error!");
      });

    const payload = {
      name: "Failure product",
      price: 100,
      image: "img.jpg",
    };

    const res = await request(app).post("/api/products").send(payload);

    expect(res.status).toBe(500);
    expect(res.body.errors[0]).toHaveProperty("message");

    saveSpy.mockRestore();
  });
});

describe("PUT /api/products/:id - Integration tests", () => {
  it("updates an existing product and returns 200 with updated data", async () => {
    const product = await Product.create({
      name: "Old Product",
      price: 100,
      image: "old.jpg",
    });

    const updatePayload = {
      name: "Updated Product",
      price: 250,
      image: "updated.jpg",
    };

    const res = await request(app)
      .put(`/api/products/${product._id}`)
      .send(updatePayload);

    expect(res.status).toBe(200);
    expect(res.body.message).toBeDefined();

    const updated = res.body.data;
    expect(updated._id).toBe((product._id as ObjectId).toString());
    expect(updated.name).toBe(updatePayload.name);
    expect(updated.price).toBe(updatePayload.price);
    expect(updated.image).toBe(updatePayload.image);
    expect(updated.updatedAt).not.toBe(product.updatedAt.toISOString());
    expect(updated.createdAt).toBe(product.createdAt.toISOString());

    const productInDb = await Product.findById(
      (product._id as ObjectId).toString(),
    );
    expect(productInDb?.name).toBe(updatePayload.name);
  });

  it("returns 400 with message for invalid product id sent", async () => {
    const invalidMongoId = 1234;

    const res = await request(app).put(`/api/products/${invalidMongoId}`).send({
      name: "Updated Product",
      price: 250,
      image: "updated.jpg",
    });

    expect(res.status).toBe(400);
    expect(res.body.errors[0].message).toMatch(/[invalid id]/i);
  });

  it("returns 400 with message when no fields to udpate", async () => {
    const product = await Product.create({
      name: "Old Product",
      price: 100,
      image: "old.jpg",
    });

    const res = await request(app).put(`/api/products/${product._id}`).send({});

    expect(res.status).toBe(400);
    expect(res.body.errors[0].message).toMatch(
      "At least one field is required to update",
    );
  });

  it("returns 404 with message when no product is found", async () => {
    const nonExistentId = new mongoose.Types.ObjectId();

    const res = await request(app)
      .put(`/api/products/${nonExistentId.toString()}`)
      .send({ name: "non-existent name" });

    expect(res.status).toBe(404);
    expect(res.body.errors[0].message).toMatch(/found/);
  });

  it("returns 500 when database update operation fails", async () => {
    const product = await Product.create({
      name: "Product existing in DB",
      price: 100,
      image: "img.jpg",
    });

    const updateSpy = vi
      .spyOn(Product, "findByIdAndUpdate")
      .mockImplementationOnce(() => {
        throw new Error("connection error / DB failure");
      });

    const res = await request(app)
      .put(`/api/products/${product._id}`)
      .send({ name: "updated name" });

    expect(res.status).toBe(500);
    expect(res.body.errors[0].message).toMatch(/Internal Server Error/i);

    updateSpy.mockRestore();
  });
});

describe("DELETE /api/products/:id - Integration Tests", () => {
  it("deletes an existing product and returns 200 with message", async () => {
    const product = await Product.create({
      name: "existing product",
      price: 50,
      image: "img.jpeg",
    });

    const res = await request(app).delete(`/api/products/${product._id}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/deleted/i);
  });

  it("returns 400 with message for invalid product id sent", async () => {
    const invalidMongoId = 1234;

    const res = await request(app).delete(`/api/products/${invalidMongoId}`);

    expect(res.status).toBe(400);
    expect(res.body.errors[0].message).toMatch(/[invalid id]/i);
  });

  it("returns 404 with message when no product found", async () => {
    const id = new mongoose.Types.ObjectId();

    const res = await request(app).delete(`/api/products/${id}`);

    expect(res.status).toBe(404);
    expect(res.body.errors[0].message).toMatch(/found/i);
  });

  it("returns 500 with message when database operation fails", async () => {
    const product = await Product.create({
      name: "existing product",
      price: 50,
      image: "img.jpeg",
    });

    vi.spyOn(Product, "findByIdAndDelete").mockImplementationOnce(() => {
      throw new Error("connection error");
    });

    const res = await request(app).delete(`/api/products/${product._id}`);

    expect(res.status).toBe(500);
    expect(res.body.errors[0].message).toMatch(/Internal Server Error/i);
  });
});
