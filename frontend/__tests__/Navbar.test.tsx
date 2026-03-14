import { screen } from "@testing-library/react";
import { Navbar } from "../src/components/Navbar";
import { renderWithProviders } from "../src/util/test-utils";
import userEvent from "@testing-library/user-event";

describe("Navbar", () => {
  it("renders title with logo which are a link to the root", () => {
    renderWithProviders(<Navbar />);

    const title = screen.getByRole("link", { name: /product store/i });
    expect(title).toHaveTextContent(/🛒/i);
    expect(title).toHaveAttribute("href", "/");
  });

  it("renders a link button for creating new product", () => {
    renderWithProviders(<Navbar />);

    const button = screen.getByRole("button", { name: "create product" });
    const createLink = button.closest("a");
    expect(createLink).toHaveAttribute("href", "/create");
  });

  it("renders a theme switch button holding an icon", () => {
    renderWithProviders(<Navbar />);

    const button = screen.getByRole("button", {
      name: /\b(dark mode icon|light mode icon)\b/i,
    });

    expect(button).toBeInTheDocument();
  });

  it("clicking theme switch button changes button icon", async () => {
    renderWithProviders(<Navbar />);
    const user = userEvent.setup();

    const initialIcon = screen.getByLabelText(
      /light mode icon|dark mode icon/i,
    );
    const button = initialIcon.closest("button");

    await user.click(button);

    const finalIcon = screen.getByLabelText(/light mode icon|dark mode icon/i);
    expect(initialIcon).not.toEqual(finalIcon);

    // testing that app theme changes in whole is responsibility of chakra ui
  });
});
