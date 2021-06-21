import React from "react";
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
import OutputTokenSelect from "./OutputTokenSelect";
import InputTokenSelect from "./InputTokenSelect";
import { useState } from "react";
import { useRenFees } from "../../hooks/useRen";
import { KnownInputChains } from "../../models/ren";

const Swap: React.FC = () => {
  const [amount, setAmount] = useState(0);
  const [inputToken, setInputToken] = useState("DOGE");

  const fees = useRenFees(inputToken as KnownInputChains);

  const onSubmit = async () => {
    console.log("fees: ", fees);
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
