import React, { useMemo } from "react"
import { Box, BoxProps, Spinner, Text, HStack } from "@chakra-ui/react"
import { useRenFees } from "../../hooks/useRen"
import { HIPPODROME_FEE, KnownInputChains } from "../../models/ren"
import { usePrice } from "../../hooks/usePrice"
import { BigNumber } from "ethers"
import { formatCurrency } from "../../utils/humanNumbers"
import SmallText from "../SmallText"

export interface SwapFeesProps extends BoxProps {
  inputName: KnownInputChains
  amount: string // hex encoded big number (10**18 decimals)
}

const SwapFees: React.FC<SwapFeesProps> = (props) => {
  const { inputName, amount: amountString, ...boxProps } = props
  const { fees } = useRenFees(inputName)
  console.log("fees: ", fees)
  const { rate } = usePrice(inputName)

  const loading = !(fees && rate)

  const amount = useMemo<BigNumber>(
    () => BigNumber.from(amountString),
    [amountString]
  )

  if (loading) {
    return (
      <Box {...boxProps} w="100%">
        <Spinner />
      </Box>
    )
  }

  if (!fees || !rate) {
    throw new Error("no fees")
  }

  const renFeeInUnderlying =
    amount.mul(fees.mint).div(10000).toNumber() / 1e8
  const minerFee = fees.lock!.toNumber() / 1e8
  const renFeeInUSD = rate * renFeeInUnderlying
  const minerFeeInUSD = rate * minerFee

  const hippodromeFee = amount.mul(HIPPODROME_FEE).div(10000).toNumber() / 1e8

  return (
    <Box {...boxProps} w="100%">
      <HStack alignItems="center">
        <SmallText>RenFee:</SmallText>
        <Text>
          {fees.mint / 100}%, {renFeeInUnderlying} ($
          {formatCurrency(renFeeInUSD)})
        </Text>
      </HStack>

      <HStack alignItems="center">
        <SmallText>Miner fee:</SmallText>
        <Text>
          {minerFee} ${inputName} (${formatCurrency(minerFeeInUSD)})
        </Text>
      </HStack>

      <HStack alignItems="center">
        <SmallText>Hippodrome fee:</SmallText>
        <Text>
          0.3% ({hippodromeFee} {inputName})
        </Text>
      </HStack>
    </Box>
  )
}

export default SwapFees
