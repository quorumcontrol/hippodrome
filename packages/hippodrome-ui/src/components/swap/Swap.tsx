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
} from "@chakra-ui/react"
import OutputTokenSelect from "./OutputTokenSelect"
import InputTokenSelect from "./InputTokenSelect"
import SmallText from "../SmallText"
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
import { useRenOutput } from "../../hooks/useRen"
import { constants } from "ethers"

const Swap: React.FC = () => {
  const { safeAddress, chain } = useChainContext()
  const [amount, setAmount] = useState(0)
  const [inputToken, setInputToken] = useState("DOGE")
  const history = useHistory()
  const [outputToken, setOutputToken] = useState(
    "0xc0f14c88250e680ecd70224b7fba82b7c6560d12" // wPTG
  )
  console.log('val: ', parseValueToHex(amount, 8), ' amount: ', amount)
  const { output:renOutput } = useRenOutput(inputToken as KnownInputChains, parseValueToHex(amount, 8))
  console.log('renOutput: ', renOutput?.toString())
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
      getLockAndMint(chain, {
        lockNetwork: inputToken as KnownInputChains,
        to: safeAddress!,
        nonce,
        outputToken,
      })
      history.push(mintUrl({
        inputToken, 
        to: safeAddress!,
        nonce, 
        swap: outputToken
      }))
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
        <Heading as="h1" fontWeight="" fontSize="2xl">
          Convert {selectedInputToken?.symbol} to {selectedOutputToken?.name}
        </Heading>
        <SmallText fontSize="10" color="gray.400">
          Converted coins are on Polygon Network
        </SmallText>
      </VStack>

      <VStack spacing="4" width="100%">
        <Box w="100%">
          <SmallText>Send</SmallText>
          <HStack
            background="gray.900"
            alignItems="center"
            px="3"
            py="3"
            rounded="lg"
            marginTop="3"
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
          <SmallText>Receive</SmallText>
          <HStack
            background="gray.900"
            alignItems="center"
            px="3"
            py="3"
            marginTop="3"
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
              output={selectedOutputToken!}
              amount={(renOutput || constants.Zero).toHexString()} // TODO: subtract fees
            />
          </HStack>
        </Box>
      </VStack>

      <SwapFees
        inputName={inputToken as KnownInputChains}
        amount={parseValueToHex(amount, 8)}
      />
      <Button
        w="100%"
        // fontSize="14"
        letterSpacing="wider"
        textTransform="uppercase"
        fontWeight="bold"
        padding="6"
        onClick={onSubmit}
      >
        Swap
      </Button>
    </VStack>
  )
}

export default Swap
