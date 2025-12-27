import { useState } from "react";
import {
  Container,
  Heading,
  VStack,
  Input,
  Button,
  Box,
  useColorModeValue,
  useToast,
} from "@chakra-ui/react";
import { useProductStore } from "../store/product";

export const CreatePage = () => {
  const [fieldValues, setFieldValues] = useState({
    name: "",
    price: "",
    image: "",
  });
  const { createProduct } = useProductStore();
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { success, message } = await createProduct(fieldValues);

    if (success) {
      toast({
        title: "Success",
        description: message,
        status: "success",
        isClosable: true,
      });
    } else {
      toast({
        title: "Error",
        description: message,
        status: "error",
        isClosable: true,
      });
    }
  };

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
                placeholder="Price"
                name="price"
                value={fieldValues.price}
                onChange={(e) =>
                  setFieldValues({ ...fieldValues, price: e.target.value })
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

              <Button type="sumbit" variant={"solid"} colorScheme="blue">
                Add Product
              </Button>
            </VStack>
          </form>
        </Box>
      </VStack>
    </Container>
  );
};
