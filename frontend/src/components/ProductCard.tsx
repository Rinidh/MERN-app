import {
  Box,
  Button,
  Heading,
  HStack,
  IconButton,
  Image,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  useColorModeValue,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import { FaRegEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { useProductStore } from "../store/product";
import { useState } from "react";
import type { Product, ProductInput } from "../store/product";

type ProductCardProps = { product: Product };

export const ProductCard = ({ product }: ProductCardProps): JSX.Element => {
  const [currentValues, setCurrentValues] = useState<ProductInput>({
    name: product.name || "",
    price: product.price || null,
    image: product.image || "",
  });
  const styles = useColorModeValue(
    {
      color: "blue.900",
      bg: "gray.100",
    },
    {
      color: "white",
      bg: "gray.800",
    }
  );
  const { deleteProduct, updateProduct } = useProductStore();
  const { isOpen, onClose, onOpen } = useDisclosure();

  const areSameValues =
    product.name === currentValues.name.trim() &&
    product.price === Number(currentValues.price) && //
    product.image === currentValues.image.trim();

  return (
    <Box
      rounded={"lg"}
      shadow={"lg"}
      overflow={"hidden"}
      bg={styles.bg}
      color={styles.color}
      transition={"all 350ms"}
      _hover={{ transform: "translateY(-5px)", shadow: "xl" }}
    >
      <Image
        src={product.image}
        alt={product.name}
        w={"full"}
        objectFit={"cover"}
        objectPosition={"center"}
        h={250}
      />

      <VStack alignItems={"start"} p={10}>
        <Heading fontSize={"lg"}>{product.name}</Heading>
        <Text fontSize={"lg"} mb={15}>
          $ {product.price}
        </Text>

        <HStack>
          <IconButton
            aria-label="edit product"
            icon={<FaRegEdit />}
            colorScheme="blue"
            onClick={onOpen}
          />
          <IconButton
            aria-label="Delete product"
            icon={<MdDelete />}
            colorScheme="red"
            onClick={() => deleteProduct(product._id)}
          />
        </HStack>
      </VStack>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Update {product.name}</ModalHeader>
          <ModalCloseButton />

          <ModalBody>
            <Input
              placeholder="Product Name"
              value={currentValues.name}
              onChange={(e) =>
                setCurrentValues({ ...currentValues, name: e.target.value })
              }
            />
            <Input
              placeholder="Price"
              value={currentValues.price}
              onChange={(e) =>
                setCurrentValues({
                  ...currentValues,
                  price: Number(e.target.value),
                })
              }
            />
            <Input
              placeholder="Image URL"
              value={currentValues.image}
              onChange={(e) =>
                setCurrentValues({ ...currentValues, image: e.target.value })
              }
            />
          </ModalBody>

          <ModalFooter>
            <Button
              colorScheme="blue"
              mr={3}
              onClick={() => {
                updateProduct(product._id, currentValues);
                onClose();
              }}
              isDisabled={areSameValues}
            >
              Update
            </Button>
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};
