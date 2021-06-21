import React from "react";
import { inputTokens } from "../../models/tokenList";
import Select from "react-select";
import { Box } from "@chakra-ui/react";

const InputTokenSelect: React.FC = () => {
  return (
    <Box w="lg">
      <Select
        options={inputTokens.map((token) => ({
          label: token.name,
          value: token.symbol,
        }))}
      />
    </Box>
  );
};

export default InputTokenSelect;
