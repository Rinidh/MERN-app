import { render, screen, waitFor, within } from "@testing-library/react";
import { ProductCard } from "../../src/components/ProductCard";
import { Product } from "../../src/store/product";
import userEvent, { UserEvent } from "@testing-library/user-event";

const deleteProduct = vi.fn();
const updateProduct = vi.fn();

vi.mock("../../src/store/product", () => ({
  useProductStore: () => ({
    deleteProduct,
    updateProduct,
  }),
}));

const product: Product = {
  _id: "id1",
  name: "product1",
  price: 10,
  image: "img1",
};

const setup = () => {
  const user = userEvent.setup();
  render(<ProductCard product={product} />);
  return { user };
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("ProductCard", () => {
  describe("rendering", () => {
    it("renders a card with image, name heading, price, edit and delete buttons", () => {
      setup();

      expect(screen.getByRole("img")).toHaveAttribute("src", product.image);
      expect(
        screen.getByRole("heading", { name: product.name }),
      ).toBeInTheDocument();
      expect(
        screen.getByText(new RegExp(String(product.price))),
      ).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /edit/i })).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /delete/i }),
      ).toBeInTheDocument();
    });
  });

  describe("card action buttons", () => {
    it("does not render modal initially and it opens on clicking edit button", async () => {
      const { user } = setup();

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

      const editButton = screen.getByRole("button", { name: /edit/i });
      await user.click(editButton);

      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("calls deleteProduct with product id on clicking delete button", async () => {
      setup();

      const deleteButton = screen.getByRole("button", { name: /delete/i });
      await userEvent.click(deleteButton);

      expect(deleteProduct).toHaveBeenCalledOnce();
      expect(deleteProduct).toHaveBeenCalledWith(product._id);
    });
  });

  describe("modal and product-update form", () => {
    const openModal = async (user: UserEvent) => {
      const editButton = screen.getByRole("button", { name: /edit/i });
      await user.click(editButton);

      const modal = within(screen.getByRole("dialog"));
      return { modal };
    };

    it("modal displays inputs with current product name, price and image", async () => {
      const { user } = setup();

      const { modal } = await openModal(user);

      expect(modal.getByPlaceholderText(/name/i)).toHaveValue(product.name);
      expect(modal.getByPlaceholderText(/price/i)).toHaveValue(
        String(product.price),
      );
      expect(modal.getByPlaceholderText(/image/i)).toHaveValue(product.image);
    });

    it("closes modal via cancel and close buttons", async () => {
      const { user } = setup();
      await openModal(user);

      const cancelButton = screen.getByRole("button", { name: "Cancel" });
      await user.click(cancelButton);
      await waitFor(() =>
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
      );

      await openModal(user);

      const closeButton = screen.getByRole("button", { name: "Close" });
      await user.click(closeButton);
      await waitFor(() =>
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
      );
    });

    it("updates inputs values when user types", async () => {
      const { user } = setup();
      const { modal } = await openModal(user);

      const nameInput = modal.getByPlaceholderText(/name/i);
      const priceInput = modal.getByPlaceholderText(/price/i);
      const imageInput = modal.getByPlaceholderText(/image/i);
      await user.type(nameInput, "added to name");
      await user.type(priceInput, ".5");
      await user.type(imageInput, ".png");

      expect(
        modal.getByDisplayValue(product.name + "added to name"),
      ).toBeInTheDocument();
      expect(modal.getByDisplayValue(product.price + ".5")).toBeInTheDocument();
      expect(
        modal.getByDisplayValue(product.image + ".png"),
      ).toBeInTheDocument();
    });

    it("update button in modal is disabled until change in field values", async () => {
      const { user } = setup();
      const { modal } = await openModal(user);

      expect(modal.getByRole("button", { name: /update/i })).toBeDisabled();

      const nameInput = modal.getByPlaceholderText(/name/i);
      await user.type(nameInput, "new product name");

      expect(modal.getByRole("button", { name: /update/i })).toBeEnabled();
    });

    it("keeps update button disabled when only whitespace changes occur", async () => {
      const { user } = setup();
      const { modal } = await openModal(user);

      const priceInput = modal.getByPlaceholderText(/price/i);
      await user.type(priceInput, "   ");

      expect(modal.getByRole("button", { name: /update/i })).toBeDisabled();
    });

    it("clicking update button in modal calls updateProduct with product id and new values", async () => {
      const { user } = setup();
      const { modal } = await openModal(user);

      const nameInput = modal.getByPlaceholderText(/name/i);
      await user.clear(nameInput);
      await user.type(nameInput, "new product");
      const updateButton = modal.getByRole("button", { name: /update/i });
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
});
