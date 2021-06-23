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
  Spinner,
} from "@chakra-ui/react";
import OutputTokenSelect from "./OutputTokenSelect";
import InputTokenSelect from "./InputTokenSelect";
import { getLockAndMint, getNextNonce, KnownInputChains } from "../../models/ren";
import OutputAmount from "./OutputAmount";
import { inputTokensBySymbol } from "../../models/tokenList";
import SwapFees from "./SwapFees";
import { parseValueToHex } from "../../utils/parse";
import { useHistory } from "react-router-dom";
import { mintUrl } from "../../utils/urls";
import { useMemo } from "react";
import { useChainContext } from "../../hooks/useChainContext";

const Swap: React.FC = () => {
  const { address } = useChainContext()
  const [amount, setAmount] = useState(0);
  const [inputToken, setInputToken] = useState("DOGE");
  const history = useHistory()
  const [outputToken, setOutputToken] = useState(
    "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063"
  ); // dai - todo: wptg
  const [submitting, setSubmitting] = useState(false)

  const nonce = useMemo(() => {
    return getNextNonce()
  }, [])

  // const { getOutput } = useRenOutput(inputToken as KnownInputChains);

  const onSubmit = async () => {
    setSubmitting(true)
    try {
      getLockAndMint({ lockNetwork: (inputToken as KnownInputChains), to: address!, nonce })
      history.push(mintUrl(inputToken, address!, nonce))
    } catch (err) {
      console.error('error: ', err)
      alert('something went wrong')
    } finally {
      setSubmitting(false)
    }
  };

  if (submitting) {
    return (
      <VStack w="lg">
        <Spinner />
      </VStack>
    )
  }

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
