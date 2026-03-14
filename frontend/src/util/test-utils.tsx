import { ChakraProvider } from "@chakra-ui/react";
import { render } from "@testing-library/react";
import { FaPeopleArrows } from "react-icons/fa";
import { MemoryRouter } from "react-router-dom";

export function renderWithProviders(ui: React.ReactElement) {
  return render(
    <ChakraProvider>
      <MemoryRouter>{ui}</MemoryRouter>
    </ChakraProvider>,
  );
}
