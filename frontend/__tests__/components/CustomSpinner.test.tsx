import { render, screen } from "@testing-library/react";
import { CustomSpinner } from "../../src/components/CustomSpinner";
import { ChakraProvider, Spinner } from "@chakra-ui/react";

describe("CustomSpinner", () => {
  it("renders nothing when not loading", () => {
    const { container } = render(<CustomSpinner isLoading={false} />);

    expect(container).toBeEmptyDOMElement();
  });

  it("renders a spinner when loading", () => {
    render(
      <ChakraProvider>
        <CustomSpinner isLoading={true} />
      </ChakraProvider>,
    );

    expect(screen.getByText(/loading/i)).toBeInTheDocument(); // Chakra UI renders a div with text of loading for accessibility assistance but hides it using CSS
  });
});
