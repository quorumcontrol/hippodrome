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
  TableCaption,
  Modal,
  ModalOverlay,
  ModalContent,
  Image,
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
import { inputTokensBySymbol, supportedTokens } from "../models/tokenList"
import bitcoinLogo from "../assets/btc-icon.svg"
import SmallText from "../components/SmallText"
import OutputTokenSelect from "../components/swap/OutputTokenSelect"
import OutputAmount from "../components/swap/OutputAmount"
import { useMemo } from "react"
import { parseValueToHex } from "../utils/parse"

const StakePage: React.FC = () => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const {
    isOpen: isWithdrawModalOpen,
    onOpen: onWithModalOpen,
    onClose: onCloseWithdrawModal,
  } = useDisclosure()

  const [outputToken, setOutputToken] = useState(
    "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063"
  )

  const selectedOutputToken = useMemo(
    () => supportedTokens.find((t) => t.address === outputToken),
    [outputToken]
  )

  return (
    <>
      <VStack w="100%">
        <Box w="70%" spacing="10" alignItems="start">
          <Heading as="h1" textAlign="center" w="100%">
            Stake Your tokens and Earn
          </Heading>

          <Box w="100%" marginTop="70">
            <Table variant="simple" w="100%">
              <TableCaption>Available pools</TableCaption>
              <Thead>
                <Tr>
                  <Th>Pools</Th>
                  <Th>Value</Th>
                  <Th>action</Th>
                </Tr>
              </Thead>
              <Tbody>
                <Tr>
                  <Td>
                    <HStack spacing="4">
                      <Avatar background="white" src={bitcoinLogo} />
                      <Box>
                        <Text
                          marginBottom="4px"
                          fontSize="18px"
                          fontWeight="semibold"
                        >
                          iBTC/WBTC
                        </Text>
                        <Text
                          color="gray.400"
                          fontWeight="medium"
                          fontSize="14px"
                        >
                          SushiSWAP
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
                        0.0050.49 iBTC/ 0.334WBTC
                      </Text>
                      <Text
                        color="gray.400"
                        fontWeight="medium"
                        fontSize="14px"
                      >
                        $116.39
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
                        Stake more
                      </Button>
                      <Button
                        w="100%"
                        // fontSize="14"
                        fontWeight="semibold"
                        padding="6"
                        background="transparent"
                        border="1px"
                        borderColor="gray.600"
                        size="md"
                        onClick={onWithModalOpen}
                      >
                        Withdraw
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
          <ModalHeader>Stake and Earn</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing="4" width="100%">
              <Box width="100%">
                <SmallText>Received</SmallText>
                <HStack
                  justifyContent="space-between"
                  width="100%"
                  paddingX="6"
                  rounded="2xl"
                  marginY="2"
                  background="gray.900"
                  paddingY="5"
                >
                  <HStack>
                    <Image
                      w="40px"
                      src="https://raw.githubusercontent.com/sameepsi/quickswap-default-token-list/master/assets/dg.jpg"
                    />
                    <Text fontSize="lg">Doge</Text>
                  </HStack>

                  <Text fontSize="lg" fontWeight="medium">
                    1345
                  </Text>
                </HStack>
              </Box>

              <Box width="100%">
                <SmallText>Received</SmallText>
                <HStack
                  justifyContent="space-between"
                  width="100%"
                  paddingX="6"
                  rounded="2xl"
                  marginY="2"
                  background="gray.900"
                  paddingY="5"
                >
                  <HStack>
                    <Image
                      w="40px"
                      src="https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599/logo.png"
                    />
                    <Text fontSize="lg">Doge</Text>
                  </HStack>

                  <Text fontSize="lg" fontWeight="medium">
                    2330.34
                  </Text>
                </HStack>
              </Box>

              <VStack w="100%">
                <HStack width="100%" justifyContent="space-between">
                  <SmallText>Rate</SmallText>
                  <Text>1 DOGE = 2031 ibBTC/wBTC</Text>
                </HStack>
                <HStack width="100%" justifyContent="space-between">
                  <SmallText>Slippage tolerance</SmallText>
                  <Text>1%</Text>
                </HStack>
                <HStack width="100%" justifyContent="space-between">
                  <SmallText>MIN. to be received</SmallText>
                  <Text>2330.34 iBTC/WBTC</Text>
                </HStack>
                <HStack width="100%" justifyContent="space-between">
                  <SmallText>Network fee</SmallText>
                  <Text>$8</Text>
                </HStack>
              </VStack>
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
            >
              Stake
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal size="lg" isOpen={isWithdrawModalOpen} onClose={onCloseWithdrawModal}>
        <ModalOverlay />
        <ModalContent size background="cardBackground">
          <ModalHeader>Withdraw from pool</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing="4" width="100%">
              <Box width="100%">
                <SmallText>Received</SmallText>
                <HStack
                  justifyContent="space-between"
                  width="100%"
                  paddingX="6"
                  rounded="2xl"
                  marginY="2"
                  background="gray.900"
                  paddingY="4"
                >
                  <HStack>
                    <Image
                      w="40px"
                      src="https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xB6eD7644C69416d67B522e20bC294A9a9B405B31/logo.png"
                    />
                    <Text fontSize="lg">ibBTC/wBTC</Text>
                  </HStack>

                  <FormControl id="inputAmount" w="50%">
                    <NumberInput>
                      <NumberInputField
                        textAlign="right"
                        name="amount"
                        border="none"
                        placeholder="Enter amount"
                      />
                    </NumberInput>
                  </FormControl>
                </HStack>
              </Box>

              <Box width="100%">
                <SmallText>Received</SmallText>
                <HStack
                  bg="formBackground"
                  alignItems="center"
                  px="6"
                  paddingY="3"
                  marginTop="3"
                  rounded="lg"
                  background="gray.900"
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
                    input={inputTokensBySymbol["DOGE"].renAddress}
                    output={selectedOutputToken!}
                    amount={parseValueToHex("0")} // TODO: subtract fees
                  />
                </HStack>
              </Box>

              <VStack w="100%">
                <HStack width="100%" justifyContent="space-between">
                  <SmallText>Rate</SmallText>
                  <Text>1 DOGE = 2031 ibBTC/wBTC</Text>
                </HStack>
                <HStack width="100%" justifyContent="space-between">
                  <SmallText>Slippage tolerance</SmallText>
                  <Text>1%</Text>
                </HStack>
                <HStack width="100%" justifyContent="space-between">
                  <SmallText>MIN. to be received</SmallText>
                  <Text>2330.34 iBTC/WBTC</Text>
                </HStack>
                <HStack width="100%" justifyContent="space-between">
                  <SmallText>Network fee</SmallText>
                  <Text>$8</Text>
                </HStack>
              </VStack>
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
            >
              Withdraw
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default StakePage
