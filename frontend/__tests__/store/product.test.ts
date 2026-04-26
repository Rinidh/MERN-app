import { it, expect, describe } from "vitest";
import { useProductStore } from "../../src/store/product";
import * as util from "../../src/util";

vi.spyOn(util, "safeParseJson");
vi.spyOn(globalThis, "fetch");

beforeEach(() => {
  vi.resetAllMocks();

  useProductStore.setState({
    products: [],
    isLoading: false,
    error: null,
    message: "",
  });
});

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

  it("makes API call and adds product to state on success", async () => {
    const mockProduct = {
      _id: "1",
      name: "Test",
      price: 100,
      image: "img",
    };

    vi.mocked(fetch).mockResolvedValue({} as any);
    vi.mocked(util.safeParseJson).mockResolvedValue({
      data: mockProduct,
      message: "created",
    });

    await useProductStore.getState().createProduct({
      name: "Test",
      price: "100",
      image: "img",
    });

    const state = useProductStore.getState();

    expect(state.products).toHaveLength(1);
    expect(state.products[0]).toEqual(mockProduct);
    expect(state.isLoading).toBe(false);
    expect(state.message).toBe("created");

    expect(vi.mocked(fetch).mock.calls[0][1]).toHaveProperty("method", "POST");
    expect(vi.mocked(fetch).mock.calls[0][1]).toHaveProperty("body");
  });

  it("adds error message to error state on API failure", async () => {
    vi.mocked(fetch).mockRejectedValue(new Error("service is down"));

    await useProductStore.getState().createProduct({
      name: "Test",
      price: "100",
      image: "img",
    });

    const state = useProductStore.getState();

    expect(state.error).toBe("service is down");
    expect(state.isLoading).toBe(false);
    expect(state.products).toHaveLength(0);
  });
});

describe("fetchProducts", () => {
  it("makes API call and adds product to state on success", async () => {
    const mockProduct = {
      name: "Test",
      price: 100,
      image: "img",
    };

    vi.mocked(fetch).mockResolvedValue({} as any);
    vi.mocked(util.safeParseJson).mockResolvedValue({
      data: [mockProduct],
    });

    await useProductStore.getState().fetchProducts();

    const state = useProductStore.getState();

    expect(state.products).toHaveLength(1);
    expect(state.products[0]).toEqual(mockProduct);
    expect(state.isLoading).toBe(false);
  });

  it("adds error message to error state on API failure", async () => {
    const error = new Error("failed to fetch");
    vi.mocked(fetch).mockRejectedValue(error);

    await useProductStore.getState().fetchProducts();

    const state = useProductStore.getState();

    expect(state.error).toBe(error.message);
    expect(state.isLoading).toBe(false);
    expect(state.products).toHaveLength(0);
  });
});

describe("deleteProduct", () => {
  it("should remove product from state", async () => {
    useProductStore.setState({
      products: [{ _id: "1", name: "A", price: 10, image: "img" }],
    });

    (fetch as any).mockResolvedValue({});
    (util.safeParseJson as any).mockResolvedValue({
      message: "Deleted",
    });

    await useProductStore.getState().deleteProduct("1");

    const state = useProductStore.getState();

    expect(state.products).toEqual([]);
    expect(state.message).toBe("Deleted");
    expect(state.isLoading).toBe(false);

    expect(vi.mocked(globalThis.fetch).mock.calls[0][1]).toHaveProperty(
      "method",
      "DELETE",
    );
  });

  it("should handle error", async () => {
    (fetch as any).mockRejectedValue(new Error("Delete error"));

    await useProductStore.getState().deleteProduct("1");

    const state = useProductStore.getState();

    expect(state.error).toBe("Delete error");
    expect(state.isLoading).toBe(false);
  });
});

describe("updateProduct", () => {
  it.each([
    ["NaN", "xyz"],
    ["negative", "-1"],
  ])("fails with error if price is %s", async (_, price) => {
    await useProductStore.getState().updateProduct("1", {
      name: "valid name",
      price,
      image: "valid image url",
    });

    const state = useProductStore.getState();
    expect(state.error).toMatch(/^(?=.*price)(?=.*number).*/i);
    expect(state.isLoading).toBe(false);
  });
});
