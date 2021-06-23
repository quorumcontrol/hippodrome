import React from 'react'
import { utils } from 'ethers'
import { useTokenQuote } from '../../hooks/useTokenQuote'
import { Spinner, Box, Text } from '@chakra-ui/react'

export interface OutputAmountProps {
  input:string
  output:string
  amount:string // bignumber hex
}

const OutputAmount:React.FC<OutputAmountProps> = ({ input, output, amount }) => {
  const { amountOut, loading } = useTokenQuote(input, output, amount) // TODO: are all ren tokens 8 decimals?

  if (loading) {
    return (
      <Box>
        <Text>This will spin forever because on testnet for now</Text>
        <Spinner />
      </Box>
    )
  }

  return (
    <Box>
      <Text>You receive: {utils.formatEther(amountOut || 0)}</Text>
    </Box>
  )
  
}

export default OutputAmount