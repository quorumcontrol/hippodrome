import React from "react";
import { supportedTokens } from "../../models/tokenList";
import Select from "react-select";
import { FormControl, FormLabel, PropsOf } from "@chakra-ui/react";

const OutputTokenSelect: React.FC<Partial<PropsOf<typeof Select>>> = (userProps) => {
  const { onChange, value, ...selectProps} = userProps

  const options = supportedTokens.map((token) => ({
    label: token.name,
    value: token.address,
  }))

  return (
    <FormControl>
      <FormLabel>You Receive</FormLabel>
      <Select
        value={options.find((o) => o.value === value)}
        onChange={(changeVal) => {
          console.log('change: ', changeVal)
          onChange(changeVal?.value)
        }}
        options={supportedTokens.map((token) => ({
          label: token.name,
          value: token.address,
        }))}
        {...selectProps}
      />
    </FormControl>
  );
};

export default OutputTokenSelect;
