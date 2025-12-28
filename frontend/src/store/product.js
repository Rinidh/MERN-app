// ⭐This file is a single place for state management (hence UI updates) as well as API calls

import { create } from "zustand";

export const useProductStore = create((setState) => ({
  // all props & methods in object are part of state and passed to consumer
  products: [],
  setProducts: (products) => setState({ products }), // deals with products array in state, not individual product object

  createProduct: async (newProduct) => {
    const { name, price, image } = newProduct;

    if (!name.trim() || !price.trim() || !image.trim()) {
      return { success: false, message: "Please fill in all fields." };
    }

    const res = await fetch("/api/products", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newProduct),
    });

    const { data, success, message } = await res.json();

    if (success) return { success, message: "Product created successfully." };
    else return { success, message: "Error creating the product" };
  },
  fetchProducts: async () => {
    const res = await fetch("/api/products");
    const { data } = await res.json();
    setState({ products: data });
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
}));
