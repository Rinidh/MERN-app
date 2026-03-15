import { ChakraProvider } from "@chakra-ui/react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { HomePage } from "../../src/components/HomePage";
import { useProductStore } from "../../src/store/product";
import { ProductCard } from "../../src/components/ProductCard";
import { CustomSpinner } from "../../src/components/CustomSpinner";

const fetchProducts = vi.fn();
const setMessage = vi.fn();
let storeState;

vi.mock("../../src/store/product", () => ({
  useProductStore: () => storeState,
}));

vi.mock("../../src/components/ProductCard", () => ({
  ProductCard: vi.fn((product: any) => <div data-testid="product-card"></div>),
}));

vi.mock("../../src/components/CustomSpinner", () => ({
  CustomSpinner: ({ isLoading }: { isLoading: boolean }) =>
    isLoading && <div data-testid="spinner"></div>,
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
  beforeEach(() => {
    vi.clearAllMocks();

    storeState = {
      fetchProducts,
      setMessage,
      products: [],
      error: "",
      isLoading: false,
      message: "",
    };
  });

  it("calls fetchProducts on mount", () => {
    renderPage();

    expect(fetchProducts).toHaveBeenCalledOnce();
  });

  it("renders page heading about products", () => {
    renderPage();

    expect(
      screen.getByRole("heading", { name: /products/i }),
    ).toBeInTheDocument();
  });

  it("renders products from store as ProductCards", () => {
    storeState.products = [
      { _id: "id1", name: "product1", price: 10, image: "img1" },
      { _id: "id2", name: "product2", price: 20, image: "img2" },
    ];

    renderPage();

    const cards = screen.getAllByTestId("product-card");
    expect(cards.length).toBe(2);
    const productPassed = vi.mocked(ProductCard).mock.calls[0][0].product; // .mock.calls.firstCall.firstArg is the props object passed by React
    expect(productPassed._id).toBe("id1");
  });

  it("renders empty state message when there are no products and not loading", () => {
    renderPage();

    expect(screen.getByText(/no products found/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /create/i })).toBeInTheDocument();
  });

  it("renders spinner when loading state", () => {
    storeState.isLoading = true;

    renderPage();

    expect(screen.getByTestId("spinner")).toBeInTheDocument();
  });
});

// TESTS remaining:
// error state opens the modal and shows error message
// Retry button in modal triggers fetchProducts
// success message triggers a toast
// error message triggers a toast
