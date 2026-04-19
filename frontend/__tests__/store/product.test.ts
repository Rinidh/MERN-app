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
