import { render, screen } from "@testing-library/react";
import { ProductCard } from "../../src/components/ProductCard";
import { Product } from "../../src/store/product";
import userEvent from "@testing-library/user-event";
import { useProductStore } from "../../src/store/product";

const deleteProduct = vi.fn();

vi.mock("../../src/store/product", () => ({
  useProductStore: () => ({
    deleteProduct,
  }),
}));

describe("ProductCard", () => {
  it("renders a card with image, name heading, price, edit and delete buttons", () => {
    const product: Product = {
      _id: "id1",
      name: "product1",
      price: 10,
      image: "img1",
    };

    render(<ProductCard product={product} />);

    expect(screen.getByRole("img")).toHaveAttribute("src", product.image);
    expect(
      screen.getByRole("heading", { name: product.name }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(new RegExp(String(product.price))),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /edit/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /delete/i })).toBeInTheDocument();
  });

  it("modal opens on clicking edit button", async () => {
    const product: Product = {
      _id: "id1",
      name: "product1",
      price: 10,
      image: "img1",
    };
    render(<ProductCard product={product} />);

    const editButton = screen.getByRole("button", { name: /edit/i });
    await userEvent.click(editButton);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("calls deleteProduct with product id on clicking delete button", async () => {
    const product: Product = {
      _id: "id1",
      name: "product1",
      price: 10,
      image: "img1",
    };
    render(<ProductCard product={product} />);

    const deleteButton = screen.getByRole("button", { name: /delete/i });
    await userEvent.click(deleteButton);

    expect(deleteProduct).toHaveBeenCalledOnce();
  });
});

// product modal displays inputs with current product name, price and image
// update button in modal is disabled until change in field values
// clicking update button in modal calls updateProduct with product id and new values
