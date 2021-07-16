import React from "react"
import { Box, HStack, Text, Image, Spinner } from "@chakra-ui/react"
import dogeLogo from "../../assets/doge-icon.svg"
import { useTokenQuote } from "../../hooks/useTokenQuote"
import humanBigNumber from "../../utils/humanNumbers"
import { isTestnet } from "../../models/ren"
import { RENDOGE_ADDRESS, WPTG_ADDRESS } from "../../models/contracts"
import { BigNumber } from "ethers"
import { useMemo } from "react"

interface OutputAmountProps {
  input: string
  amount: BigNumber
}

const StakeOutputTokenAmount: React.FC<OutputAmountProps> = ({
  input,
  amount,
}) => {
  const half = useMemo(() => {
    return BigNumber.from(amount).div(2)
  }, [amount])

  const { amountOut: wPTGamount, loading: wPTgLoading } = useTokenQuote(
    input,
    WPTG_ADDRESS,
    half.toHexString()
  )
  const { amountOut: renDogeAmount, loading: renDogeLoading } = useTokenQuote(
    input,
    RENDOGE_ADDRESS,
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
            src="https://arena.cryptocolosseum.com/images/icons/prestige.svg"
          />
          <Text fontSize="sm">wPTG</Text>
        </HStack>

        <Text fontSize="md" fontWeight="medium">
          {humanBigNumber(wPTGamount || 0, 18)}
        </Text>
      </HStack>
      <HStack>
        <HStack>
          <Image w="30px" src={dogeLogo} />
          <Text fontSize="sm" fontWeight="">
            renDoge
          </Text>
        </HStack>

        <Text fontSize="md" fontWeight="medium">
          {humanBigNumber(renDogeAmount || 0, 8)}
        </Text>
      </HStack>
    </HStack>
  )
}

export default StakeOutputTokenAmount
