import React from "react";
import { Button, Container, Flex, HStack, Text } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { AddIcon } from "@chakra-ui/icons";

export const Navbar = () => {
  return (
    <Container maxW={"1140px"}>
      <Flex spacing={2} alignItems={"center"} justifyContent={"space-between"}>
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
              <AddIcon boxSize={3} />
            </Button>
          </Link>
          <Button variant="outline">Toggle Theme</Button>
        </HStack>
      </Flex>
    </Container>
  );
};
