import { useEffect, useState } from "react";
import {
  Container,
  Heading,
  VStack,
  Input,
  Button,
  Box,
  useColorModeValue,
  useToast,
  Spinner,
} from "@chakra-ui/react";
import { useProductStore } from "../store/product";
import type { ProductInput } from "../store/product";

export const CreatePage = () => {
  const [fieldValues, setFieldValues] = useState<ProductInput>({
    name: "",
    price: null,
    image: "",
  });
  const { createProduct, error, isLoading, message, setMessage } =
    useProductStore();
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await createProduct(fieldValues);
  };

  useEffect(() => {
    if (message) {
      toast({
        title: "Success",
        description: message,
        status: "success",
        isClosable: true,
      });
      setFieldValues({ name: "", price: null, image: "" });
      setMessage("");
    }
    if (error) {
      toast({
        title: "Error",
        description: error,
        status: "error",
        isClosable: true,
      });
      setMessage("");
    }
  }, [message, error, toast, setMessage]);

  return (
    <Container maxW={"container.sm"}>
      <VStack>
        <Heading as={"h1"} mt={8} mb={8}>
          Create New Product
        </Heading>

        <Box
          w={"full"}
          rounded={"lg"}
          p={4}
          bg={useColorModeValue("white", "gray.800")}
        >
          <form onSubmit={handleSubmit}>
            <VStack spacing={4}>
              <Input
                placeholder="Product Name"
                name="name"
                value={fieldValues.name}
                onChange={(e) =>
                  setFieldValues({ ...fieldValues, name: e.target.value })
                }
              />
              <Input
                type="number"
                placeholder="Price"
                name="price"
                value={fieldValues.price}
                onChange={(e) =>
                  setFieldValues({
                    ...fieldValues,
                    price: Number(e.target.value),
                  })
                }
              />
              <Input
                placeholder="Image URL"
                name="image"
                value={fieldValues.image}
                onChange={(e) =>
                  setFieldValues({ ...fieldValues, image: e.target.value })
                }
              />

              <Button
                type="submit"
                variant={"solid"}
                colorScheme="blue"
                width={"full"}
              >
                {isLoading ? (
                  <Spinner borderWidth={"medium"} size={"md"} />
                ) : (
                  "Add Product"
                )}
              </Button>
            </VStack>
          </form>
        </Box>
      </VStack>
    </Container>
  );
};
