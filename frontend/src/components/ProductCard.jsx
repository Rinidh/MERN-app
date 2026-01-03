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
  useToast,
  VStack,
} from "@chakra-ui/react";
import { FaRegEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { useProductStore } from "../store/product";
import { useEffect, useState } from "react";

export const ProductCard = ({ product }) => {
  const [currentValues, setCurrentValues] = useState({
    name: product.name,
    price: product.price,
    image: product.image,
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
  const { deleteProduct, updateProduct, message, setMessage } =
    useProductStore();
  const toast = useToast();
  const { isOpen, onClose, onOpen } = useDisclosure();

  useEffect(() => {
    if (message) {
      toast({
        title: "Success",
        description: message,
        status: "success",
        duration: 3000,
      });
      setMessage("");
    }
    // errors will be shown in the modal in HomePage
  }, [message]);

  const areSameValues =
    product.name === currentValues.name.trim() &&
    product.price === currentValues.price &&
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
            icon={<FaRegEdit />}
            colorScheme="blue"
            onClick={onOpen}
          />
          <IconButton
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
              value={currentValues.name}
              onChange={(e) =>
                setCurrentValues({ ...currentValues, name: e.target.value })
              }
            />
            <Input
              value={currentValues.price}
              onChange={(e) =>
                setCurrentValues({ ...currentValues, price: e.target.value })
              }
            />
            <Input
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
              disabled={areSameValues}
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
