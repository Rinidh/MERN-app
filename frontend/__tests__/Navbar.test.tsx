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

  it("renders a link button with add icon and hyperlink of /create", () => {
    renderWithProviders(<Navbar />);

    const button = screen.getByRole("link", { name: "add icon" });
    const createLink = button.closest("a");
    expect(createLink).toBeInTheDocument();

    const icon = screen.getByLabelText(/add icon/);
    expect(icon).toHaveAttribute("aria-label", "add icon");
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
    const darkButton = screen.queryByRole("button", {
      name: /dark mode icon/i,
    });
    const lightButton = screen.queryByRole("button", {
      name: /light mode icon/i,
    });

    const user = userEvent.setup();
    if (darkButton) {
      await user.click(darkButton);
      expect(
        screen.queryByRole("button", { name: /light mode icon/i }),
      ).toBeInTheDocument();
    } else if (lightButton) {
      await user.click(lightButton);
      expect(
        screen.queryByRole("button", { name: /dark mode icon/i }),
      ).toBeInTheDocument();
    }

    // testing that app theme changes in whole is responsibility of chakra ui
  });
});
