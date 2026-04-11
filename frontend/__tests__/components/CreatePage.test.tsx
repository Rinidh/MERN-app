import { it, expect, describe } from "vitest";
import { render, screen } from "@testing-library/react";
import { CreatePage } from "../../src/components/CreatePage";

describe("CreatePage", () => {
  it("renders a page heading, empty inputs with placeholders for name, price and image, and an Add button", () => {
    render(<CreatePage />);

    expect(
      screen.getByRole("heading", { name: /create/i }),
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/name/i)).toHaveValue("");
    expect(screen.getByPlaceholderText(/price/i)).toHaveValue(null); // value is null initially because of type="number" attribute
    expect(screen.getByPlaceholderText(/image/i)).toHaveValue("");
    expect(screen.getByRole("button", { name: /add/i })).toBeInTheDocument();
  });
});

// renders a page heading, empty inputs with placeholders for name, price and image, and an Add button
// typing into inputs updates field values
// clicking the Add button calls createProduct with the values input in the fields
// button shows a spinner when in loading state
// shows a sucess toast when message is present
// resets input fields' values after success toast
// shows an error toast when error is present
