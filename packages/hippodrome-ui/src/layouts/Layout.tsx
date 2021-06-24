import { Flex, Spacer, Text, Box, Heading, VStack } from "@chakra-ui/react";
import React from "react";
import CurrentUser from "../components/CurrentUser";
import { useChainContext } from "../hooks/useChainContext";

const Layout: React.FC = ({ children }) => {
  const { address } = useChainContext();

  return (
    <Box>
      <Flex w="100%" p={10} mb={4}>
        <Heading size="lg" fontWeight="medium">hippodrome</Heading>
        <Spacer />
        <CurrentUser />
      </Flex>
      {!address && (
        <VStack>
          <Text>Please connect your wallet</Text>
        </VStack>
      )}
      {address && children}
    </Box>
  );
};

export default Layout;
