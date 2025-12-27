import { useEffect } from "react";
import { Container, Heading, SimpleGrid, Text, VStack } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { useProductStore } from "../store/product";
import { ProductCard } from "./ProductCard";

export const HomePage = () => {
  const { fetchProducts, products } = useProductStore();

  useEffect(() => {
    fetchProducts();
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

        {/* FALL BACK TEXT & LINK WHEN NO PRODUCTS FOUND */}
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
      </VStack>
    </Container>
  );
};
