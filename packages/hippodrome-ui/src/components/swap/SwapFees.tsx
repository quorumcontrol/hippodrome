import React, { useMemo } from "react";
import { Box, BoxProps, Spinner, Text } from "@chakra-ui/react";
import { useRenFees } from "../../hooks/useRen";
import { KnownInputChains } from "../../models/ren";
import { usePrice } from "../../hooks/usePrice";
import { BigNumber } from "ethers";
import { formatCurrency } from "../../utils/humanNumbers";

export interface SwapFeesProps extends BoxProps {
  inputName: KnownInputChains
  amount: string // hex encoded big number (10**18 decimals)
}

const SwapFees: React.FC<SwapFeesProps> = (props) => {
  const { inputName, amount:amountString, ...boxProps } = props
  const { fees } = useRenFees(inputName);
  const { rate } = usePrice(inputName)

  const loading = !(fees && rate)

  const amount = useMemo<BigNumber>(() => BigNumber.from(amountString), [amountString])


  if (loading) {
    return (
      <Box {...boxProps}>
        <Spinner />
      </Box>
    );
  }

  if (!fees || !rate) {
    throw new Error('no fees')
  }

  const renFeeInUnderlying = amount.mul(fees.mint).div(1e10.toString()).toNumber() / 1e12// TODO: not all inputs are 1e8
  const minerFee = fees.lock!.toNumber() / 1e8
  const renFeeInUSD = rate * renFeeInUnderlying
  const minerFeeInUSD = rate * minerFee

  return (
    <Box {...boxProps}>
      <Text>
        RenFee: {fees.mint / 100}%, {renFeeInUnderlying} (${formatCurrency(renFeeInUSD)})
      </Text>
      <Text>
        Miner fee: {minerFee} ${inputName} (${formatCurrency(minerFeeInUSD)})
      </Text>
    </Box>
  )
};

export default SwapFees;
