import React from 'react'
import { useTokenQuote } from '../../hooks/useTokenQuote'
import { Spinner, Box, Text } from '@chakra-ui/react'
import { isTestnet } from '../../models/ren'
import humanBigNumber from '../../utils/humanNumbers'
import { TokenListToken } from '../../models/tokenList'

export interface OutputAmountProps {
  input:string
  output:TokenListToken
  amount:string, // bignumber hex (18 decimals)
}

const OutputAmount:React.FC<OutputAmountProps> = ({ input, output, amount }) => {
  const { amountOut, loading } = useTokenQuote(input, output.address, amount)

  if (loading) {
    return (
      <Box>
        {isTestnet && <Text>(testnet does not complete)</Text>}
        <Spinner />
      </Box>
    )
  }

  return (
    <Box>
      <Text fontSize="2xl">{humanBigNumber(amountOut || 0, output.decimals)}</Text>
    </Box>
  )
  
}

export default OutputAmount
