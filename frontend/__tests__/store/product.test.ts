import { it, expect, describe } from "vitest";
import { useProductStore } from "../../src/store/product";

// beforeEach(() => {

// })

describe("Product store - initial state", () => {
  it("has the correct default values", () => {
    const state = useProductStore.getState();

    expect(state.products).toEqual([]);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
    expect(state.message).toBe("");
  });
});

describe("setError and setMessage", () => {
  // testing if these helper functions enable state modification externally by consumer components

  it("sets message property in state", () => {
    useProductStore.getState().setMessage("successfully done");

    expect(useProductStore.getState().message).toBe("successfully done");
  });

  it("sets error property in state", () => {
    useProductStore.getState().setError("something went wrong");

    expect(useProductStore.getState().error).toBe("something went wrong");
  });
});

describe("createProduct", () => {
  it.each([
    ["name", { name: "", price: "10", image: "valid image url" }],
    ["price", { name: "valid name", price: "  ", image: "valid image url" }],
    ["image", { name: "valid name", price: "15", image: "" }],
  ])("fails with error when %s field is missing", async (_, product) => {
    await useProductStore.getState().createProduct(product);

    const state = useProductStore.getState();
    expect(state.error).toBe("Please fill in all fields.");
    expect(state.isLoading).toBe(false);
  });

  it.each([
    ["NaN", "xyz"],
    ["negative", "-1"],
  ])("fails with error if price is %s", async (_, price) => {
    await useProductStore
      .getState()
      .createProduct({ name: "valid name", price, image: "valid image url" });

    const state = useProductStore.getState();
    expect(state.error).toBe("Price must be a valid number.");
    expect(state.isLoading).toBe(false);
  });
});
