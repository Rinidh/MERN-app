import { screen } from "@testing-library/react";
import { Navbar } from "../src/components/Navbar";
import { renderWithProviders } from "../src/util/test-utils";
import userEvent from "@testing-library/user-event";

describe("Navbar", () => {
  const getThemeIcon = () => {
    const icon = screen.getByLabelText(/\b(dark mode icon|light mode icon)\b/i);
    return { icon, currentLabel: icon.getAttribute("aria-label") };
  };

  it("renders title with logo which are a link to the root", () => {
    renderWithProviders(<Navbar />);

    const title = screen.getByRole("link", { name: /product store/i });
    expect(title).toHaveTextContent(/🛒/i);
    expect(title).toHaveAttribute("href", "/");
  });

  it("renders a link button with add icon and hyperlink of /create", () => {
    renderWithProviders(<Navbar />);

    const links = screen.getAllByRole("link");
    const createLink = links.find((l) => l.getAttribute("href") === "/create");
    expect(createLink).toBeInTheDocument();

    const icon = createLink.querySelector("svg");
    expect(icon).toHaveAttribute("aria-label", "add icon");
  });

  it("renders a theme switch button holding an icon", () => {
    renderWithProviders(<Navbar />);

    expect(getThemeIcon().icon.parentElement).toBeInstanceOf(HTMLButtonElement);
  });

  it("clicking theme switch button changes button icon", async () => {
    renderWithProviders(<Navbar />);
    const { icon, currentLabel } = getThemeIcon();
    const button = icon.parentElement;
    const user = userEvent.setup();

    await user.click(button);

    if (currentLabel === "dark mode icon") {
      expect(getThemeIcon().currentLabel).toBe("light mode icon");
    } else if (currentLabel === "light mode icon") {
      expect(getThemeIcon().currentLabel).toBe("dark mode icon");
    }

    // testing that app theme changes in whole is responsibility of chakra ui
  });
});
