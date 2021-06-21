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
import { BigNumber } from "ethers";
import OutputTokenSelect from "./OutputTokenSelect";
import InputTokenSelect from "./InputTokenSelect";
import { useRenOutput } from "../../hooks/useRen";
import { KnownInputChains } from "../../models/ren";
import OutputAmount from "./OutputAmount";
import { inputTokensBySymbol } from "../../models/tokenList";
import SwapFees from "./SwapFees";
import { parseValueToHex } from "../../utils/parse";

const Swap: React.FC = () => {
  const [amount, setAmount] = useState(0);
  const [inputToken, setInputToken] = useState("DOGE");
  const [outputToken, setOutputToken] = useState(
    "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063"
  ); // dai - todo: wptg

  const { getOutput } = useRenOutput(inputToken as KnownInputChains);

  const onSubmit = async () => {
    const out = getOutput(BigNumber.from(amount));
    console.log("out: ", out.toString());
  };

  return (
    <VStack w="lg">
      <InputTokenSelect
        onChange={(value: string) => {
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
      <OutputTokenSelect
        onChange={(address: string) => {
          console.log("output: ", address);
          setOutputToken(address);
        }}
        value={outputToken}
      />
      <OutputAmount
        input={inputTokensBySymbol[inputToken].renAddress}
        output={outputToken}
        amount={parseValueToHex(amount)}
      />
      <SwapFees inputName={inputToken as KnownInputChains} amount={parseValueToHex(amount)}/>
      <Button onClick={onSubmit}>Swap</Button>
    </VStack>
  );
};

export default Swap;
