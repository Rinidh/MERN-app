import { render, screen, waitFor } from "@testing-library/react";
import { ProductCard } from "../../src/components/ProductCard";
import { Product } from "../../src/store/product";
import userEvent from "@testing-library/user-event";

const deleteProduct = vi.fn();
const updateProduct = vi.fn();

vi.mock("../../src/store/product", () => ({
  useProductStore: () => ({
    deleteProduct,
    updateProduct,
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

  it("does not render modal initially and it opens on clicking edit button", async () => {
    const product: Product = {
      _id: "id1",
      name: "product1",
      price: 10,
      image: "img1",
    };
    render(<ProductCard product={product} />);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    const editButton = screen.getByRole("button", { name: /edit/i });
    await userEvent.click(editButton);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("modal displays inputs with current product name, price and image", async () => {
    const product: Product = {
      _id: "id1",
      name: "product1",
      price: 10,
      image: "img1",
    };
    render(<ProductCard product={product} />);
    const editButton = screen.getByRole("button", { name: /edit/i });
    await userEvent.click(editButton);

    expect(screen.getByPlaceholderText(/name/i)).toHaveValue(product.name);
    expect(screen.getByPlaceholderText(/price/i)).toHaveValue(
      String(product.price),
    );
    expect(screen.getByPlaceholderText(/image/i)).toHaveValue(product.image);
  });

  it("closes modal when cancel button is clicked", async () => {
    const product: Product = {
      _id: "id1",
      name: "product1",
      price: 10,
      image: "img1",
    };
    render(<ProductCard product={product} />);
    const editButton = screen.getByRole("button", { name: /edit/i });
    const user = userEvent.setup();
    await user.click(editButton);

    const cancelButton = screen.getByRole("button", { name: "Cancel" });
    await user.click(cancelButton);

    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
  });

  it("closes modal when close button is clicked", async () => {
    const product: Product = {
      _id: "id1",
      name: "product1",
      price: 10,
      image: "img1",
    };
    render(<ProductCard product={product} />);
    const editButton = screen.getByRole("button", { name: /edit/i });
    const user = userEvent.setup();
    await user.click(editButton);

    const closeButton = screen.getByRole("button", { name: "Close" });
    await user.click(closeButton);

    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
  });

  it("updates inputs values when user types", async () => {
    const product: Product = {
      _id: "id1",
      name: "product1",
      price: 10,
      image: "img1",
    };
    render(<ProductCard product={product} />);
    const editButton = screen.getByRole("button", { name: /edit/i });
    const user = userEvent.setup();
    await user.click(editButton);

    const nameInput = screen.getByPlaceholderText(/name/i);
    const priceInput = screen.getByPlaceholderText(/price/i);
    const imageInput = screen.getByPlaceholderText(/image/i);
    await user.type(nameInput, "added to name");
    await user.type(priceInput, ".5");
    await user.type(imageInput, ".png");

    expect(
      screen.getByDisplayValue(product.name + "added to name"),
    ).toBeInTheDocument();
    expect(screen.getByDisplayValue(product.price + ".5")).toBeInTheDocument();
    expect(
      screen.getByDisplayValue(product.image + ".png"),
    ).toBeInTheDocument();
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
    expect(deleteProduct).toHaveBeenCalledWith(product._id);
  });

  it("update button in modal is disabled until change in field values", async () => {
    const product: Product = {
      _id: "id1",
      name: "product1",
      price: 10,
      image: "img1",
    };
    render(<ProductCard product={product} />);
    const editButton = screen.getByRole("button", { name: /edit/i });
    const user = userEvent.setup();
    await user.click(editButton);

    expect(screen.getByRole("button", { name: /update/i })).toBeDisabled();

    const nameInput = screen.getByPlaceholderText(/name/i);
    await user.type(nameInput, "new product name");

    expect(screen.getByRole("button", { name: /update/i })).toBeEnabled();
  });

  it("keeps update button disabled when only whitespace changes occur", async () => {
    const product: Product = {
      _id: "id1",
      name: "product1",
      price: 10,
      image: "img1",
    };
    render(<ProductCard product={product} />);
    const editButton = screen.getByRole("button", { name: /edit/i });
    const user = userEvent.setup();
    await user.click(editButton);

    const priceInput = screen.getByPlaceholderText(/price/i);
    await user.type(priceInput, "   ");

    expect(screen.getByRole("button", { name: /update/i })).toBeDisabled();
  });

  it("clicking update button in modal calls updateProduct with product id and new values", async () => {
    const product: Product = {
      _id: "id1",
      name: "product1",
      price: 10,
      image: "img1",
    };
    render(<ProductCard product={product} />);
    const editButton = screen.getByRole("button", { name: /edit/i });
    const user = userEvent.setup();
    await user.click(editButton);

    const nameInput = screen.getByPlaceholderText(/name/i);
    await user.clear(nameInput);
    await user.type(nameInput, "new product");
    const updateButton = screen.getByRole("button", { name: /update/i });
    await user.click(updateButton);

    expect(updateProduct).toHaveBeenCalledOnce();
    expect(updateProduct).toHaveBeenCalledWith(product._id, {
      name: "new product",
      price: "10",
      image: "img1",
    });
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
  });
});
