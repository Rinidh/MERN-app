import { it, expect, describe, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { CreatePage } from "../../src/components/CreatePage";
import userEvent from "@testing-library/user-event";

const createProduct = vi.fn();
const setMessage = vi.fn();
const toast = vi.fn();
let storeState;

vi.mock("../../src/store/product", () => ({
  useProductStore: () => storeState,
}));
vi.mock("@chakra-ui/react", async () => {
  const actual = await vi.importActual("@chakra-ui/react");

  return { ...actual, useToast: () => toast };
});

beforeEach(() => {
  vi.clearAllMocks();
  storeState = {
    createProduct,
    error: "",
    isLoading: false,
    message: "",
    setMessage,
  };
});

describe("CreatePage", () => {
  const user = userEvent.setup({ delay: null });

  it("renders a page heading, empty inputs with placeholders for name, price and image, and an Add button", () => {
    render(<CreatePage />);

    expect(
      screen.getByRole("heading", { name: /create/i }),
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/name/i)).toHaveValue("");
    expect(screen.getByPlaceholderText(/price/i)).toHaveValue("");
    expect(screen.getByPlaceholderText(/image/i)).toHaveValue("");
    expect(screen.getByTestId("add-button")).toBeInTheDocument();
  });

  it("typing into inputs updates field values", async () => {
    render(<CreatePage />);

    const nameInput = screen.getByPlaceholderText(/name/i);
    const priceInput = screen.getByPlaceholderText(/price/i);
    const imageInput = screen.getByPlaceholderText(/image/i);
    await user.type(nameInput, "product name");
    await user.type(priceInput, "10");
    await user.type(imageInput, "img.png");

    expect(nameInput).toHaveValue("product name");
    expect(priceInput).toHaveValue("10");
    expect(imageInput).toHaveValue("img.png");
  });

  it("Add button is disabled when any field is unfilled", async () => {
    render(<CreatePage />);

    await user.type(screen.getByPlaceholderText(/name/i), "product1");
    await user.type(screen.getByPlaceholderText(/price/i), "10");
    // image field is left empty

    expect(screen.getByPlaceholderText(/image/i)).toHaveValue("");
    expect(screen.getByTestId("add-button")).toBeDisabled();
  });

  it("clicking the Add button calls createProduct with the values input in the fields", async () => {
    render(<CreatePage />);

    const nameInput = screen.getByPlaceholderText(/name/i);
    const priceInput = screen.getByPlaceholderText(/price/i);
    const imageInput = screen.getByPlaceholderText(/image/i);

    const fieldValues = { name: "product name", price: "10", image: "img.png" };
    await user.type(nameInput, fieldValues.name);
    await user.type(priceInput, fieldValues.price);
    await user.type(imageInput, fieldValues.image);

    await user.click(screen.getByTestId("add-button"));

    expect(createProduct).toHaveBeenCalledOnce();
    expect(createProduct).toHaveBeenCalledWith(fieldValues);
  });

  it("button shows a spinner when in loading state and is disabled", () => {
    storeState.isLoading = true;

    render(<CreatePage />);

    expect(screen.getByRole("status")).toBeInTheDocument();
    const addButton = screen.getByTestId("add-button");
    expect(addButton).not.toHaveTextContent(/add/i);
    expect(addButton).toBeDisabled();
  });

  it("shows a success toast when message is present", () => {
    storeState.message = "created successfully";

    render(<CreatePage />);

    expect(toast).toHaveBeenCalledOnce();
    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Success",
        description: "created successfully",
        status: "success",
      }),
    );
    expect(setMessage).toHaveBeenCalledWith("");
  });

  it("resets input fields' values after success toast", async () => {
    const { rerender } = render(<CreatePage />);

    const inputs = screen.getAllByRole("textbox");
    inputs.forEach((input) => {
      fireEvent.change(input, {
        target: {
          value: "field value input",
        },
      });
    });

    storeState.message = "created successfully";
    rerender(<CreatePage />);

    const clearedInputs = screen.getAllByRole("textbox");
    expect(clearedInputs.length).toBe(3);
    clearedInputs.forEach((input) => {
      expect(input).toHaveValue("");
    });
  });

  it("shows an error toast when error is present", () => {
    storeState.error = "failed to create";

    render(<CreatePage />);

    expect(toast).toHaveBeenCalledOnce();
    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Error",
        description: "failed to create",
        status: "error",
      }),
    );
    expect(setMessage).toHaveBeenCalledWith("");
  });
});
