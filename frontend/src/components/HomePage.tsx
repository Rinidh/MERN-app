import { useEffect } from "react";
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
  useToast,
  VStack,
} from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { useProductStore } from "../store/product";
import { ProductCard } from "./ProductCard";
import { CustomSpinner } from "./CustomSpinner";

export const HomePage = (): JSX.Element => {
  const {
    fetchProducts,
    products,
    error,
    isLoading,
    message,
    setMessage,
    setError,
  } = useProductStore();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    if (error) onOpen();
    else onClose();
  }, [error, onClose, onOpen]);

  useEffect(() => {
    if (message) {
      toast({
        title: "Success",
        description: message,
        status: "success",
        isClosable: true,
      });
      setMessage("");
    }
    if (error) {
      toast({
        title: "Error",
        description: error,
        status: "error",
        isClosable: true,
      });
      setError("");
    }
  }, [message, error, toast, setMessage, setError]);

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
          width={"full"}
        >
          {products.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </SimpleGrid>

        {!isLoading && products.length === 0 && (
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

        <CustomSpinner isLoading={isLoading} />
      </VStack>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent
          bg={useColorModeValue("pink.100", "red.900")}
          aria-label="error dialog"
        >
          <ModalHeader>Error</ModalHeader>
          <ModalCloseButton />
          <ModalBody>{error}</ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={fetchProducts}>
              Retry
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
};
