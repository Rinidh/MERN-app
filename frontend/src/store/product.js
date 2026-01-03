import { create } from "zustand";
import { safeParseJson } from "../util";

export const useProductStore = create((setState) => ({
  products: [],
  isLoading: false,
  error: null, // server message upon error
  message: "", // server message upon success
  setMessage: (message) => setState({ message }),

  createProduct: async (newProduct) => {
    const { name, price, image } = newProduct;

    if (!name?.trim() || !price?.trim() || !image?.trim()) {
      return { success: false, message: "Please fill in all fields." };
    }

    if (window.isNaN(price) || Number(price) <= 0) {
      return { success: false, message: "Price must be a valid number." };
    }

    setState({ error: null, isLoading: true, message: "" });

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newProduct),
      });

      const { data, message } = await safeParseJson(res);

      setState((state) => ({
        products: [...state.products, data],
        isLoading: false,
        message: message || "Product created successfully",
      }));
    } catch (error) {
      console.error("Error creating product", error);
      setState({
        isLoading: false,
        error: error.message,
      });
    }
  },
  fetchProducts: async () => {
    setState({ isLoading: true, error: null, message: "" });

    try {
      const res = await fetch("/api/products");

      const { data } = await safeParseJson(res);

      setState({ products: data, isLoading: false });
    } catch (error) {
      console.error("Error fetching products:", error);

      setState({
        products: [],
        isLoading: false,
        error: error.message || "Error fetching products. Try again later",
      });
    }
  },
  deleteProduct: async (id) => {
    setState({ error: null, isLoading: true, message: "" });

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      });

      const { message } = await safeParseJson(res);

      setState((state) => ({
        products: state.products.filter((p) => p._id !== id),
        message,
        isLoading: false,
      }));
    } catch (error) {
      console.error("Error deleting product:", error);

      setState({
        error: error.message,
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

      const { message, data } = await safeParseJson(res);

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
