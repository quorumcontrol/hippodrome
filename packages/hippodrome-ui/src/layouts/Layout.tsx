import { Box, Heading } from "@chakra-ui/layout";
import React from "react";

const Layout: React.FC = ({ children }) => {
  return (
    <Box>
      <Box w="100%" p={4} borderBottom="1px">
        <Heading>Hippodrome</Heading>
      </Box>
      {children}
    </Box>
  );
};

export default Layout