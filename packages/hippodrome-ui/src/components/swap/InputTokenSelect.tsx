import React from "react";
import { inputTokens } from "../../models/tokenList";
import Select from "react-select";
import { FormControl, FormLabel, PropsOf } from "@chakra-ui/react";

const InputTokenSelect: React.FC<Partial<PropsOf<typeof Select>>> = (userProps) => {
  const { onChange, value, ...selectProps } = userProps

  const options = inputTokens.map((token) => ({
    label: token.name,
    value: token.symbol,
  }))

  return (
    <FormControl id="inputToken">
      <FormLabel>You Send</FormLabel>
      <Select
        value={options.find((o) => o.value === value)}
        onChange={(changeVal) => {
          console.log('change: ', changeVal)
          onChange(changeVal?.value)
        }}
        options={options}
        {...selectProps}
      />
    </FormControl>
  );
};

export default InputTokenSelect;
