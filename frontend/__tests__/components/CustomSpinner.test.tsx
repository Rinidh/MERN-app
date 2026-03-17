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

  it("renders a fullscreen overlay", () => {
    render(
      <ChakraProvider>
        <CustomSpinner isLoading={true} />
      </ChakraProvider>,
    );

    const overlay = screen.getByTestId("overlay");
    expect(overlay).toBeInTheDocument();
    expect(overlay).toHaveStyle({
      position: "fixed",
      top: "0px",
      bottom: "0px",
      right: "0px",
      left: "0px",
    });
  });
});
