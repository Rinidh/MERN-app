import { ChakraProvider } from "@chakra-ui/react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { HomePage } from "../../src/components/HomePage";
import { useProductStore } from "../../src/store/product";
import { ProductCard } from "../../src/components/ProductCard";
import { CustomSpinner } from "../../src/components/CustomSpinner";
import userEvent from "@testing-library/user-event";

const fetchProducts = vi.fn();
const setMessage = vi.fn();
let storeState;

vi.mock("../../src/store/product", () => ({
  useProductStore: () => storeState,
}));

vi.mock("../../src/components/ProductCard", () => ({
  ProductCard: vi.fn(({ product }: { product: any }) => (
    <div data-testid="product-card"></div>
  )),
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

  it("error state opens the modal and toast with error message", () => {
    storeState.error = "Network Error";

    renderPage();

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByLabelText("error dialog")).toBeInTheDocument();

    const modalAndToast = screen.getAllByText(/network error/i); // both a toast and the modal display the same error message in error state
    expect(modalAndToast.length).toBe(2);
  });

  it("Retry button in modal triggers fetchProducts", async () => {
    storeState.error = "Failed!";
    renderPage();

    const button = screen.getByRole("button", { name: /retry/i });
    await userEvent.click(button);

    expect(fetchProducts).toHaveBeenCalledTimes(2); // the first call is default on render and the second call is by clicking the retry button
  });

  it("success message triggers a toast", () => {
    storeState.message = "completed";

    renderPage();

    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByText("completed")).toBeInTheDocument();
  });
});
