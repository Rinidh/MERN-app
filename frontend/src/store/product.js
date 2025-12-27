import { create } from "zustand";

export const useProductStore = create((setState) => ({
  // all props & methods in object are part of state and passed to consumer
  products: [],
  setProducts: (products) => setState({ products }), //? setState((prevState) => ({...prevState, products}))
  createProduct: async (newProduct) => {
    const { name, price, image } = newProduct;

    if (!name || !price || !image) {
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

    if (success) {
      setState((prevState) => ({ ...prevState, products: data }));
      return { success, message: "Product created successfully." };
    } else {
      return { success, message: "Error creating the product" };
    }
  },
}));
