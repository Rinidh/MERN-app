import { Flex, Spinner, useColorModeValue } from "@chakra-ui/react";

export const CustomSpinner = ({
  isLoading,
}: {
  isLoading: boolean;
}): JSX.Element | null => {
  if (!isLoading) return null;

  return (
    <Flex
      position={"fixed"}
      top={0}
      bottom={0}
      right={0}
      left={0}
      backgroundColor={useColorModeValue("whiteAlpha.600", "blackAlpha.600")}
      data-testid="overlay"
    >
      <Spinner
        role="status"
        position={"absolute"}
        top={"50%"}
        left={"50%"}
        borderWidth={"thick"}
        size={"xl"}
        color={useColorModeValue("blue.900", "blue.300")}
        zIndex={10}
      />
    </Flex>
  );
};
