import React, { useState } from "react"
import {
  Box,
  VStack,
  HStack,
  NumberInput,
  NumberInputField,
  FormControl,
  Button,
  Spinner,
  Heading,
  Text,
} from "@chakra-ui/react"
import OutputTokenSelect from "./OutputTokenSelect"
import InputTokenSelect from "./InputTokenSelect"
import {
  getLockAndMint,
  getNextNonce,
  KnownInputChains,
} from "../../models/ren"
import OutputAmount from "./OutputAmount"
import {
  inputTokens,
  inputTokensBySymbol,
  supportedTokens,
} from "../../models/tokenList"
import SwapFees from "./SwapFees"
import { parseValueToHex } from "../../utils/parse"
import { useHistory } from "react-router-dom"
import { mintUrl } from "../../utils/urls"
import { useMemo } from "react"
import { useChainContext } from "../../hooks/useChainContext"

const Swap: React.FC = () => {
  const { safeAddress } = useChainContext()
  const [amount, setAmount] = useState(0)
  const [inputToken, setInputToken] = useState("DOGE")
  const history = useHistory()
  const [outputToken, setOutputToken] = useState(
    "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063"
  ) // dai - todo: wptg
  const [submitting, setSubmitting] = useState(false)

  const selectedInputToken = useMemo(
    () => inputTokens.find((t) => t.symbol === inputToken),
    [inputToken]
  )
  const selectedOutputToken = useMemo(
    () => supportedTokens.find((t) => t.address === outputToken),
    [outputToken]
  )

  const nonce = useMemo(() => {
    return getNextNonce()
  }, [])

  const onSubmit = async () => {
    setSubmitting(true)
    try {
      getLockAndMint({
        lockNetwork: inputToken as KnownInputChains,
        to: safeAddress!,
        nonce,
        outputToken,
      })
      history.push(mintUrl(inputToken, safeAddress!, nonce, outputToken))
    } catch (err) {
      console.error("error: ", err)
      alert("something went wrong")
    } finally {
      setSubmitting(false)
    }
  }

  if (submitting) {
    return (
      <VStack w="lg">
        <Spinner />
      </VStack>
    )
  }

  return (
    <VStack w="100%" spacing="10">
      <VStack w="100%" spacing="3" alignItems="start">
        <Heading as="h1" fontSize="2xl">
          Convert {selectedInputToken?.symbol} to {selectedOutputToken?.name}
        </Heading>
        <Heading
          as="h2"
          fontSize="medium"
          color="gray.300"
          fontWeight="normal"
          marginBottom=""
        >
          👉🏽 On the Polygon network 👈
        </Heading>
      </VStack>

      <VStack spacing="4" width="100%">
        <Box w="100%">
          <Text fontWeight="medium" marginBottom="3" color="gray.100">
            Send
          </Text>
          <HStack
            bg="formBackground"
            alignItems="center"
            px="3"
            py="3"
            rounded="lg"
          >
            <InputTokenSelect
              onChange={(value: string) => {
                console.dir(value)
                setInputToken(value)
              }}
              value={inputToken}
              selectedToken={selectedInputToken}
              inputTokens={inputTokens}
            />
            <FormControl id="inputAmount">
              <NumberInput>
                <NumberInputField
                  textAlign="right"
                  name="amount"
                  border="none"
                  placeholder="Enter amount to send"
                  onChange={(evt) => setAmount(parseFloat(evt.target.value))}
                  value={amount}
                />
              </NumberInput>
            </FormControl>
          </HStack>
        </Box>
        <Box w="100%">
          <Text fontWeight="medium" marginBottom="3" color="gray.100">
            Receive
          </Text>
          <HStack
            bg="formBackground"
            alignItems="center"
            px="3"
            py="3"
            rounded="lg"
          >
            <OutputTokenSelect
              onChange={(address: string) => {
                console.log("output: ", address)
                setOutputToken(address)
              }}
              value={outputToken}
              selectedToken={selectedOutputToken}
              supportedTokens={supportedTokens}
            />
            <OutputAmount
              input={inputTokensBySymbol[inputToken].renAddress}
              output={outputToken}
              amount={parseValueToHex(amount)} // TODO: subtract fees
            />
          </HStack>
        </Box>
      </VStack>

      <SwapFees
        inputName={inputToken as KnownInputChains}
        amount={parseValueToHex(amount)}
      />
      <Button w="100%" padding="6" onClick={onSubmit}>
        Swap
      </Button>
    </VStack>
  )
}

export default Swap
