// ⭐This file is a single place for state management (hence UI updates) as well as API calls

import { create } from "zustand";

export const useProductStore = create((setState) => ({
  // all props & methods in object are part of state and passed to consumer
  products: [],
  setProducts: (products) => setState({ products }), // deals with products array in state, not individual product object

  createProduct: async (newProduct) => {
    const { name, price, image } = newProduct;

    if (!name?.trim() || !price?.trim() || !image?.trim()) {
      return { success: false, message: "Please fill in all fields." };
    }

    if (window.isNaN(price) || Number(price) <= 0) {
      return { success: false, message: "Price must be a valid number." };
    }

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newProduct),
      });

      const { data, message } = await res.json();

      if (!res.ok) {
        return {
          success: false,
          message: message || "Failed to create product",
        };
      }

      setState((state) => ({ products: [...state.products, data] }));

      return {
        success: true,
        message: message || "Product created successfully",
      };
    } catch (error) {
      console.error("Error creating product", error);
      return {
        success: false,
        message: "Network error. Please try again later",
      };
    }
  },
  fetchProducts: async () => {
    try {
      const res = await fetch("/api/products");
      const { data, message } = await res.json();

      if (!res.ok) throw new Error(message);

      setState({ products: data });

      return { success: true };
    } catch (error) {
      console.error("Error fetching products:", error.message);
      setState({ products: [] });
      return {
        success: false,
        message: error.message || "Error fetching products. Try again later",
      };
    }
  },
  deleteProduct: async (id) => {
    const res = await fetch(`/api/products/${id}`, {
      method: "DELETE",
    });
    const { success, message } = await res.json();

    if (success)
      setState((state) => ({
        products: state.products.filter((p) => p._id !== id),
      }));

    return { success, message };
  },
  updateProduct: async (pid, updatedProduct) => {
    const res = await fetch(`/api/products/${pid}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedProduct),
    });
    const { success, message, data } = await res.json();

    if (success)
      setState((state) => ({
        products: state.products.map((p) => (p._id === pid ? data : p)),
      }));

    return { success, message: "Product updated successfully" };
  },
}));
