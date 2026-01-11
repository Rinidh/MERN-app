import { create } from "zustand";
import { safeParseJson } from "../util";

/* -----------------------------
   Domain types
------------------------------ */

export type Product = {
  _id: string;
  name: string;
  price: number;
  image: string;
};

/**
 * Shape expected when creating/updating a product
 * (before it has an _id)
 */
export type ProductInput = {
  name: string;
  price: string | number; // can be string in HTMLInputElement.value otherwise always a number eg in product sent to/fetched from server
  image: string;
};

/**
 * Standard response returned by store actions
 * (used by createProduct)
 */
type ActionResult = {
  success: boolean;
  message: string;
};

/**
 * Shape of backend API response body's json
 */
type ApiResponse<T> = {
  data?: T;
  message?: string;
};

/* -----------------------------
   Store state + actions
------------------------------ */

type ProductStore = {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  message: string;

  setMessage: (message: string) => void;

  createProduct: (newProduct: ProductInput) => Promise<ActionResult | void>;
  fetchProducts: () => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  updateProduct: (
    pid: string,
    updatedProduct: Partial<ProductInput>
  ) => Promise<void>;
};

/* -----------------------------
   Store implementation
------------------------------ */

export const useProductStore = create<ProductStore>((setState) => ({
  products: [],
  isLoading: false,
  error: null, // server message upon error
  message: "", // server message upon success

  setMessage: (message) => setState({ message }),

  createProduct: async (newProduct) => {
    const { name, price, image } = newProduct;

    setState({ error: null, isLoading: true, message: "" });

    if (!name?.trim() || !image?.trim() || price === undefined) {
      setState({ isLoading: false, error: "Please fill in all fields." });
      return;
    }

    if (Number.isNaN(Number(price)) || Number(price) <= 0) {
      setState({ isLoading: false, error: "Price must be a valid number." });
      return;
    }

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...newProduct, price: Number(price) }),
      });

      const { data, message } = await safeParseJson<ApiResponse<Product>>(res);

      setState((state) => ({
        products: [...state.products, data],
        isLoading: false,
        message: message || "Product created successfully",
      }));
    } catch (error) {
      console.error("Error creating product", error);
      setState({
        isLoading: false,
        error:
          error instanceof Error ? error.message : "Failed to create product",
      });
    }
  },

  fetchProducts: async () => {
    setState({ isLoading: true, error: null, message: "" });

    try {
      const res = await fetch("/api/products");

      const { data } = await safeParseJson<ApiResponse<Product[]>>(res);

      setState({ products: data, isLoading: false });
    } catch (error) {
      console.error("Error fetching products:", error);

      setState({
        products: [],
        isLoading: false,
        error:
          error instanceof Error
            ? error.message
            : "Error fetching products. Try again later",
      });
    }
  },

  deleteProduct: async (id) => {
    setState({ error: null, isLoading: true, message: "" });

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      });

      const { message } = await safeParseJson<ApiResponse<null>>(res);

      setState((state) => ({
        products: state.products.filter((p) => p._id !== id),
        message,
        isLoading: false,
      }));
    } catch (error) {
      console.error("Error deleting product:", error);

      setState({
        error:
          error instanceof Error ? error.message : "Failed to delete product",
        isLoading: false,
      });
    }
  },

  updateProduct: async (pid, updatedProduct) => {
    setState({ error: null, message: "", isLoading: true });

    try {
      const res = await fetch(`/api/products/${pid}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedProduct),
      });

      const { message, data } = await safeParseJson<ApiResponse<Product>>(res);

      setState((state) => ({
        products: state.products.map((p) => (p._id === pid ? data : p)),
        message,
        isLoading: false,
      }));
    } catch (error) {
      console.error("Error updating product", error);

      setState({
        error: error.message,
        isLoading: false,
      });
    }
  },
}));
