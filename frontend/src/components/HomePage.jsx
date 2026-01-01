import { useEffect, useState } from "react";
import {
  Button,
  Container,
  Heading,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  SimpleGrid,
  Text,
  useColorModeValue,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { useProductStore } from "../store/product";
import { ProductCard } from "./ProductCard";

export const HomePage = () => {
  const { fetchProducts, products } = useProductStore();
  const [error, setError] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();

  const fetch = async () => {
    const { success, message } = await fetchProducts();
    if (!success) {
      onOpen();
      setError(message);
    } else {
      onClose();
    }
  };

  useEffect(() => {
    fetch();
  }, [fetchProducts]);

  return (
    <Container maxW={"container.xl"} p={10}>
      <VStack>
        <Heading
          as={"h1"}
          fontSize={"xl"}
          fontWeight={"bold"}
          pb={4}
          bgGradient={"linear-gradient(to-l, #00498eff, #0075ceff)"}
          bgClip={"text"}
        >
          Available Products 🚀
        </Heading>

        <SimpleGrid
          columns={{
            base: 1,
            md: 2,
            lg: 3,
          }}
          spacing={10}
        >
          {products.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </SimpleGrid>

        {products.length === 0 && (
          <Text fontWeight={"bold"} fontSize={"lg"} color={"gray.500"}>
            No Products found 🥲{" "}
            <Link to={"/create"}>
              <Text
                as={"span"}
                color={"#0075ceff"}
                _hover={{ textDecoration: "underline" }}
              >
                Create a Product
              </Text>
            </Link>
          </Text>
        )}
      </VStack>

      <Modal isOpen={isOpen}>
        <ModalOverlay />
        <ModalContent bg={useColorModeValue("pink.100", "red.900")}>
          <ModalHeader>Error</ModalHeader>
          <ModalCloseButton />
          <ModalBody>{error}</ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={fetch}>
              Retry
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
};
