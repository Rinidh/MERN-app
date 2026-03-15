import { ChakraProvider } from "@chakra-ui/react";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { HomePage } from "../../src/components/HomePage";
import { useProductStore } from "../../src/store/product";

const fetchProductsMock = vi.fn();
const setMessageMock = vi.fn();

vi.mock("../../src/store/product", () => ({
  useProductStore: () => ({
    fetchProducts: fetchProductsMock,
    setMessage: setMessageMock,
    products: [],
    error: "",
    isLoading: false,
    message: "",
  }),
}));

const renderPage = () => {
  return render(
    <ChakraProvider>
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    </ChakraProvider>,
  );
};

describe("HomePage", () => {
  it("calls fetchProducts on mount", () => {
    renderPage();

    expect(fetchProductsMock).toHaveBeenCalledOnce();
  });
});

// TESTS:
// calls fetchProducts on mount
// renders page heading about products
// renders products from store as ProductCards
// renders empty state message when there are no products and not loading
// renders spinner when loading state
// error state opens the modal and shows error message
// Retry button in modal triggers fetchProducts
// success message triggers a toast
// error message triggers a toast
