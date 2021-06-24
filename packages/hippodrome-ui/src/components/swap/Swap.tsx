import React, { useState } from "react";
import {
  Box,
  VStack,
  HStack,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  FormControl,
  FormLabel,
  Button,
  Spinner,
  Text,
} from "@chakra-ui/react";
import OutputTokenSelect from "./OutputTokenSelect";
import InputTokenSelect from "./InputTokenSelect";
import {
  getLockAndMint,
  getNextNonce,
  KnownInputChains,
} from "../../models/ren";
import OutputAmount from "./OutputAmount";
import { inputTokensBySymbol } from "../../models/tokenList";
import SwapFees from "./SwapFees";
import { parseValueToHex } from "../../utils/parse";
import { useHistory } from "react-router-dom";
import { mintUrl } from "../../utils/urls";
import { useMemo } from "react";
import { useChainContext } from "../../hooks/useChainContext";

const Swap: React.FC = () => {
  const { safeAddress } = useChainContext();
  const [amount, setAmount] = useState(0);
  const [inputToken, setInputToken] = useState("DOGE");
  const history = useHistory();
  const [outputToken, setOutputToken] = useState(
    "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063"
  ); // dai - todo: wptg
  const [submitting, setSubmitting] = useState(false);

  const nonce = useMemo(() => {
    return getNextNonce();
  }, []);

  // const { getOutput } = useRenOutput(inputToken as KnownInputChains);

  const onSubmit = async () => {
    setSubmitting(true);
    try {
      getLockAndMint({
        lockNetwork: inputToken as KnownInputChains,
        to: safeAddress!,
        nonce,
      });
      history.push(mintUrl(inputToken, safeAddress!, nonce));
    } catch (err) {
      console.error("error: ", err);
      alert("something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitting) {
    return (
      <VStack w="lg">
        <Spinner />
      </VStack>
    );
  }

  return (
    <Box w="lg">
      <Box mb="10">
        <Text>Send</Text>
        <HStack bg="formBackground" px="4" py="4" rounded="lg">
          <InputTokenSelect
            onChange={(value: string) => {
              console.dir(value);
              setInputToken(value);
            }}
            value={inputToken}
          />
          <FormControl id="inputAmount">
            <NumberInput>
              <NumberInputField
                fontSize="2xl"
                textAlign="right"
                name="amount"
                placeholder="Amount to send"
                onChange={(evt) => setAmount(parseFloat(evt.target.value))}
                value={amount}
              />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </FormControl>
        </HStack>
      </Box>
      <Box>
        <Text>Receive</Text>
        <HStack bg="formBackground" px="4" py="4" rounded="lg">
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
        </HStack>
      </Box>
      <SwapFees
        my="10"
        inputName={inputToken as KnownInputChains}
        amount={parseValueToHex(amount)}
      />
      <Button w="100%" onClick={onSubmit}>Swap</Button>
    </Box>
  );
};

export default Swap;
