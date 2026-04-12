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
    expect(screen.getByPlaceholderText(/price/i)).toHaveValue(""); // value is null initially because of type="number" attribute
    expect(screen.getByPlaceholderText(/image/i)).toHaveValue("");
    expect(screen.getByRole("button", { name: /add/i })).toBeInTheDocument();
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

  it("clicking the Add button calls createProduct with the values input in the fields", async () => {
    render(<CreatePage />);

    const nameInput = screen.getByPlaceholderText(/name/i);
    const priceInput = screen.getByPlaceholderText(/price/i);
    const imageInput = screen.getByPlaceholderText(/image/i);

    const fieldValues = { name: "product name", price: "10", image: "img.png" };
    await user.type(nameInput, fieldValues.name);
    await user.type(priceInput, fieldValues.price);
    await user.type(imageInput, fieldValues.image);

    await user.click(screen.getByRole("button", { name: /add/i }));

    expect(createProduct).toHaveBeenCalledOnce();
    expect(createProduct.mock.calls[0][0]).toEqual(fieldValues);
  });

  it("button shows a spinner when in loading state", () => {
    storeState.isLoading = true;

    render(<CreatePage />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("shows a sucess toast when message is present", async () => {
    storeState.message = "created successfully";

    render(<CreatePage />);

    expect(toast).toHaveBeenCalledOnce();
    waitFor(() => expect(screen.getByRole("status")).toBeInTheDocument(), {
      timeout: 2000,
    });
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

    storeState.message = "created successfully"; // change to success state
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
    waitFor(() => expect(screen.getByRole("status")).toBeInTheDocument(), {
      timeout: 2000,
    });
  });
});
