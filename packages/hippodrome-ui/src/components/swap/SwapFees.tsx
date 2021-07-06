import React, { useMemo } from "react"
import { Box, BoxProps, Spinner, Text, HStack } from "@chakra-ui/react"
import { useRenFees } from "../../hooks/useRen"
import { KnownInputChains } from "../../models/ren"
import { usePrice } from "../../hooks/usePrice"
import { BigNumber, utils } from "ethers"
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
    amount.mul(fees.mint).div((1e10).toString()).toNumber() / 1e12 // TODO: not all inputs are 1e8
  const minerFee = fees.lock!.toNumber() / 1e8
  const renFeeInUSD = rate * renFeeInUnderlying
  const minerFeeInUSD = rate * minerFee

  const referrersFee =
    (Number(utils.formatEther(amountString || 0)) * 0.3) / 100

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
          0.3% ({referrersFee} {inputName})
        </Text>
      </HStack>
    </Box>
  )
}

export default SwapFees
