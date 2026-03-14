import {
  Button,
  Container,
  Flex,
  HStack,
  Text,
  useColorMode,
} from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { AddIcon, SunIcon, MoonIcon } from "@chakra-ui/icons";

export function Navbar(): JSX.Element {
  const { colorMode, toggleColorMode } = useColorMode();

  return (
    <Container maxW={"1140px"}>
      <Flex alignItems={"center"} justifyContent={"space-between"}>
        <Link to="/">
          <Text
            fontSize={"2xl"}
            fontWeight={"700"}
            textTransform={"uppercase"}
            bgGradient="linear(to-l, #004a8aff, #0077b3ff)"
            bgClip="text"
          >
            Product Store 🛒
          </Text>
        </Link>

        <HStack spacing={2}>
          <Link to="/create">
            <Button variant="outline">
              <AddIcon boxSize={3} aria-label="add icon" />
            </Button>
          </Link>
          <Button variant="outline" onClick={toggleColorMode}>
            {colorMode === "light" ? (
              <MoonIcon aria-label="dark mode icon" />
            ) : (
              <SunIcon aria-label="light mode icon" />
            )}
          </Button>
        </HStack>
      </Flex>
    </Container>
  );
}
