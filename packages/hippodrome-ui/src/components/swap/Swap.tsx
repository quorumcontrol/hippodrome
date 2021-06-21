import React, { useState } from "react";
import {
  VStack,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  FormControl,
  FormLabel,
  Button,
} from "@chakra-ui/react";
import { BigNumber } from 'ethers'
import OutputTokenSelect from "./OutputTokenSelect";
import InputTokenSelect from "./InputTokenSelect";
import {  useRenOutput } from "../../hooks/useRen";
import { KnownInputChains } from "../../models/ren";

const Swap: React.FC = () => {
  const [amount, setAmount] = useState(0);
  const [inputToken, setInputToken] = useState("DOGE");

  const { getOutput } = useRenOutput(inputToken as KnownInputChains)

  const onSubmit = async () => {
    const out = await getOutput(BigNumber.from(amount))
    console.log("out: ", out.toString())
  };

  return (
    <VStack w="lg">
      <InputTokenSelect
        onChange={(value:string) => {
          console.dir(value);
          setInputToken(value);
        }}
        value={inputToken}
      />
      <FormControl id="inputAmount">
        <FormLabel>Amount</FormLabel>
        <NumberInput>
          <NumberInputField
            name="amount"
            onChange={(evt) => setAmount(parseFloat(evt.target.value))}
            value={amount}
          />
          <NumberInputStepper>
            <NumberIncrementStepper />
            <NumberDecrementStepper />
          </NumberInputStepper>
        </NumberInput>
      </FormControl>
      <OutputTokenSelect />
      <Button onClick={onSubmit}>Fees</Button>
    </VStack>
  );
};

export default Swap;
