import React from "react";
import { supportedTokens, TokenListToken } from "../models/tokenList";
import Select from "react-select";
import { Box } from "@chakra-ui/react";

const TokenOption: React.FC<{ token: TokenListToken }> = ({ token }) => {
  return <option>{token.name}</option>;
};

const Swap: React.FC = () => {
  return (
    <Box w="lg">
      <Select
        options={supportedTokens.map((token) => ({
          label: token.name,
          value: token.address,
        }))}
      />
    </Box>
  );
};

export default Swap;
