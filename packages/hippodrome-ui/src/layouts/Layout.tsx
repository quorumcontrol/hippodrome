import { Box, Heading } from "@chakra-ui/layout";
import React from "react";

const Layout: React.FC = ({ children }) => {
  return (
    <Box>
      <Box bg="black" w="100%" p={4} color="white">
        <Heading>Hippodrome</Heading>
      </Box>
      {children}
    </Box>
  );
};

export default Layout