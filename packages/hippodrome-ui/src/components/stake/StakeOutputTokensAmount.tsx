import React from "react"
import { Box, HStack, Text, Image, Spinner } from "@chakra-ui/react"
import { useTokenQuote } from "../../hooks/useTokenQuote"
import humanBigNumber from "../../utils/humanNumbers"
import { isTestnet } from "../../models/ren"
import { BigNumber } from "ethers"
import { useMemo } from "react"
import { Pool } from "../../models/poolList"

interface OutputAmountProps {
  input: string
  amount: BigNumber
  pool: Pool
}

const StakeOutputTokenAmount: React.FC<OutputAmountProps> = ({
  input,
  amount,
  pool
}) => {
  const half = useMemo(() => {
    return BigNumber.from(amount).div(2)
  }, [amount])

  const { amountOut: token0Amt, loading: wPTgLoading } = useTokenQuote(
    input,
    pool.token0().address,
    half.toHexString()
  )
  const { amountOut: token1Amt, loading: renDogeLoading } = useTokenQuote(
    input,
    pool.token1().address,
    half.toHexString()
  )

  if (wPTgLoading || renDogeLoading) {
    return (
      <Box>
        {isTestnet && <Text>(testnet does not complete)</Text>}
        <Spinner />
      </Box>
    )
  }

  return (
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
        <HStack>
          <Image
            w="30px"
            src={pool.token0().logoURI}
          />
          <Text fontSize="sm">{pool.token0().symbol}</Text>
        </HStack>

        <Text fontSize="md" fontWeight="medium">
          {humanBigNumber(token0Amt || 0, pool.token0().decimals)}
        </Text>
      </HStack>
      <HStack>
        <HStack>
          <Image w="30px" src={pool.token1().logoURI} />
          <Text fontSize="sm" fontWeight="">
            {pool.token1().symbol}
          </Text>
        </HStack>

        <Text fontSize="md" fontWeight="medium">
          {humanBigNumber(token1Amt || 0, pool.token1().decimals)}
        </Text>
      </HStack>
    </HStack>
  )
}

export default StakeOutputTokenAmount
