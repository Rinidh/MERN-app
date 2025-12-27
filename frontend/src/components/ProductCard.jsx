import {
  Box,
  Heading,
  HStack,
  IconButton,
  Image,
  Text,
  useColorModeValue,
  VStack,
} from "@chakra-ui/react";
import { FaRegEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";

export const ProductCard = ({ product }) => {
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
          <IconButton icon={<FaRegEdit />} colorScheme="blue" />
          <IconButton icon={<MdDelete />} colorScheme="red" />
        </HStack>
      </VStack>
    </Box>
  );
};
