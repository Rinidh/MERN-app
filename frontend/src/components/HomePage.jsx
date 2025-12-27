import React from "react";
import { Container, Heading, Text, VStack } from "@chakra-ui/react";
import { Link } from "react-router-dom";

export const HomePage = () => {
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
