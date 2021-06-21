import React from "react";
import { supportedTokens } from "../../models/tokenList";
import Select from "react-select";
import { Box } from "@chakra-ui/react";

const OutputTokenSelect: React.FC = () => {
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

export default OutputTokenSelect;
