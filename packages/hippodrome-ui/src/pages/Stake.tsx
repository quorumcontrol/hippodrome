import React from "react"
import {
  Box,
  VStack,
  HStack,
  Heading,
  Avatar,
  Text,
  Table,
  Thead,
  Tbody,
  Button,
  Tr,
  Th,
  Td,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  NumberInput,
  FormControl,
  NumberInputField,
} from "@chakra-ui/react"
import { useState } from "react"
import { inputTokens, inputTokensBySymbol } from "../models/tokenList"
import bitcoinLogo from "../assets/btc-icon.svg"
import SmallText from "../components/SmallText"
import { useMemo } from "react"
import { parseValueToHex } from "../utils/parse"
import InputTokenSelect from "../components/swap/InputTokenSelect"
import { useRenOutput } from "../hooks/useRen"
import { getNextNonce, KnownInputChains } from "../models/ren"
import { constants, utils } from "ethers"
import SwapFees from "../components/swap/SwapFees"
import { useHistory } from "react-router-dom"
import { mintUrl } from "../utils/urls"
import { useChainContext } from "../hooks/useChainContext"
import StakeOutputTokenAmount from "../components/stake/StakeOutputTokensAmount"
import { useUniswapPool } from "../hooks/useUniswapPool"
import { wPTGRenDogeComethPair } from "../models/stake"
import { RENDOGE_ADDRESS, WPTG_ADDRESS } from "../models/contracts"
import humanBigNumber from "../utils/humanNumbers"

const StakePage: React.FC = () => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { safeAddress } = useChainContext()
  const history = useHistory()
  const [amount, setAmount] = useState(0)
  const [inputToken, setInputToken] = useState("DOGE")
  const selectedInputToken = useMemo(
    () => inputTokens.find((t) => t.symbol === inputToken),
    [inputToken]
  )
  const { output: renOutput } = useRenOutput(
    inputToken as KnownInputChains,
    parseValueToHex(amount, 8)
  )
  const [submitting, setSubmitting] = useState(false)

  const nonce = useMemo(() => {
    return getNextNonce()
  }, [])

  const { reserves, apy } = useUniswapPool(wPTGRenDogeComethPair)

  const onSubmit = async () => {
    setSubmitting(true)
    try {
      history.push(mintUrl(inputToken, safeAddress!, nonce, "", false))
    } catch (err) {
      console.error("error: ", err)
      alert("something went wrong")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <VStack w="100%">
        <Box w="70%" spacing="10" alignItems="start">
          <Heading as="h1" textAlign="center" w="100%">
            Add liquidity and earn yield
          </Heading>

          <Box w="100%" marginTop="70">
            <Table variant="simple" w="100%">
              <Thead>
                <Tr>
                  <Th>Pools</Th>
                  <Th>APY/TVL</Th>
                  <Th>action</Th>
                </Tr>
              </Thead>
              <Tbody>
                <Tr bg="black">
                  <Td>
                    <HStack spacing="4">
                      <Avatar background="white" src={bitcoinLogo} />
                      <Box>
                        <Text
                          marginBottom="4px"
                          fontSize="18px"
                          fontWeight="semibold"
                        >
                          wPTG/renDOGE
                        </Text>
                        <Text
                          color="gray.400"
                          fontWeight="medium"
                          fontSize="14px"
                        >
                          Cometh Swap
                        </Text>
                      </Box>
                    </HStack>
                  </Td>
                  <Td>
                    <Box>
                      <Text
                        marginBottom="4px"
                        fontSize="14px"
                        fontWeight="semibold"
                      >
                        {apy?.toString()}% APY
                      </Text>
                      <Text
                        color="gray.400"
                        fontWeight="medium"
                        fontSize="14px"
                      >
                        {reserves && humanBigNumber(reserves[WPTG_ADDRESS], 18)} wPTG /{' '}
                        {reserves && humanBigNumber(reserves[RENDOGE_ADDRESS], 8)} renDOGE
                      </Text>
                    </Box>
                  </Td>
                  <Td>
                    <HStack>
                      <Button
                        w="100%"
                        fontWeight="semibold"
                        padding="6"
                        background="transparent"
                        border="1px"
                        color="brandOrange.500"
                        borderColor="gray.600"
                        size="md"
                        onClick={onOpen}
                      >
                        Add Liquidity
                      </Button>
                    </HStack>
                  </Td>
                </Tr>
              </Tbody>
            </Table>
          </Box>
        </Box>
      </VStack>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent background="cardBackground">
          <ModalHeader>Add Liquidity</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing="4" width="100%">
              <Box width="100%">
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
                        onChange={(evt) =>
                          setAmount(parseFloat(evt.target.value))
                        }
                        value={amount}
                      />
                    </NumberInput>
                  </FormControl>
                </HStack>
              </Box>

              <Box width="100%">
                <SmallText>Liquidity Supplied</SmallText>
                <StakeOutputTokenAmount
                  input={inputTokensBySymbol[inputToken].renAddress}
                  amount={(renOutput || constants.Zero)}
                />
                <SmallText color="gray.100" fontSize="10px">
                  NOTE: numbers are approximate. 1% slippage is allowed.
                </SmallText>
              </Box>

              <SwapFees
                inputName={inputToken as KnownInputChains}
                amount={parseValueToHex(amount, 8)}
              />
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button
              w="100%"
              fontSize="14"
              letterSpacing="wider"
              textTransform="uppercase"
              fontWeight="bold"
              padding="6"
              onClick={onSubmit}
              isLoading={submitting}
            >
              Continue
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default StakePage