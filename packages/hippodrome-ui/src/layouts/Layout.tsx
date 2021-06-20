import { Box, Heading } from "@chakra-ui/layout";
import { Flex, Spacer } from "@chakra-ui/react";
import React from "react";
import CurrentUser from "../components/CurrentUser";

const Layout: React.FC = ({ children }) => {
  return (
    <Box>
      <Flex w="100%" p={4} borderBottom="1px">
        <Heading>Hippodrome</Heading>
        <Spacer />
        <CurrentUser />
      </Flex>
      {children}
    </Box>
  );
};

export default Layout