import React from "react";
import { supportedTokens } from "../../models/tokenList";
import Select from "react-select";
import { FormControl, FormLabel, PropsOf } from "@chakra-ui/react";

const OutputTokenSelect: React.FC<Partial<PropsOf<typeof Select>>> = (props) => {
  return (
    <FormControl>
      <FormLabel>You Receive</FormLabel>
      <Select
        {...props}
        options={supportedTokens.map((token) => ({
          label: token.name,
          value: token.address,
        }))}
      />
    </FormControl>
  );
};

export default OutputTokenSelect;
