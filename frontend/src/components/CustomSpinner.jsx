import { Flex, Spinner, useColorModeValue } from "@chakra-ui/react";
import React from "react";

export const CustomSpinner = ({ isLoading }) => {
  return (
    <>
      {isLoading && (
        <Flex
          position={"fixed"}
          top={0}
          bottom={0}
          right={0}
          left={0}
          backgroundColor={useColorModeValue(
            "whiteAlpha.600",
            "blackAlpha.600"
          )}
        >
          <Spinner
            position={"absolute"}
            top={"50%"}
            left={"50%"}
            borderWidth={"thick"}
            size={"xl"}
            color={useColorModeValue("blue.900", "blue.300")}
            zIndex={10}
          />
        </Flex>
      )}
    </>
  );
};
