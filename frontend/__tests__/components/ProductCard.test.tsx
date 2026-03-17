import { render, screen } from "@testing-library/react";
import { ProductCard } from "../../src/components/ProductCard";
import { Product } from "../../src/store/product";

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
});

// renders a card with image, name heading, price, edit and delete buttons
// modal opens on clicking edit button
// calls deleteProduct with product id on clicking delete button
// product modal displays inputs with current product name, price and image
// update button in modal is disabled until change in field values
// clicking update button in modal calls updateProduct with product id and new values
