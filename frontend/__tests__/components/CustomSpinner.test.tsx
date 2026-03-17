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

    expect(screen.getByRole("status")).toBeInTheDocument();
  });
});
