import React from "react";
import {
  Box,
  VStack,
  HStack,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  NumberInput,
  FormControl,
  NumberInputField,
} from "@chakra-ui/react"
import { useState } from "react"
import { inputTokens, inputTokensBySymbol } from "../../models/tokenList"
import SmallText from "../../components/SmallText"
import { useMemo } from "react"
import { parseValueToHex } from "../../utils/parse"
import InputTokenSelect from "../../components/swap/InputTokenSelect"
import { useRenOutput } from "../../hooks/useRen"
import { getNextNonce, KnownInputChains } from "../../models/ren"
import { constants } from "ethers"
import SwapFees from "../../components/swap/SwapFees"
import { useHistory } from "react-router-dom"
import { mintUrl } from "../../utils/urls"
import { useChainContext } from "../../hooks/useChainContext"
import StakeOutputTokenAmount from "../../components/stake/StakeOutputTokensAmount"
import { Pool } from "../../models/poolList";

interface AddLiquidityModalParams {
  pool:Pool
  isOpen: boolean,
  onClose: ()=>void
}

const AddLiquidityModal: React.FC<AddLiquidityModalParams> = ({ pool, isOpen, onClose }) => {
  const { safeAddress } = useChainContext()
  const history = useHistory()

  const [inputToken, setInputToken] = useState("DOGE")
  const [amount, setAmount] = useState(0)

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

  const onSubmit = async () => {
    setSubmitting(true)
    try {
      history.push(mintUrl({
        inputToken, 
        to: safeAddress!, 
        nonce, 
        pool: pool.options.poolAddress
      }))
    } catch (err) {
      console.error("error: ", err)
      alert("something went wrong")
    } finally {
      setSubmitting(false)
    }
  }

  return (
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
                    console.dir(value);
                    setInputToken(value);
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
                amount={renOutput || constants.Zero}
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
  );
};

export default AddLiquidityModal;
