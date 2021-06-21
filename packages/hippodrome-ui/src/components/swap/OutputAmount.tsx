import React from 'react'
import { utils } from 'ethers'
import { useTokenQuote } from '../../hooks/useTokenQuote'
import { Spinner, Box } from '@chakra-ui/react'

export interface OutputAmountProps {
  input:string
  output:string
  amount:string // bignumber hex
}

const OutputAmount:React.FC<OutputAmountProps> = ({ input, output, amount }) => {
  const { amountOut, loading } = useTokenQuote(input, output, amount) // TODO: are all ren tokens 8 decimals?

  if (loading) {
    return <Spinner />
  }

  return (
    <Box>
      You receive: {utils.formatEther(amountOut || 0)}
    </Box>
  )
  
}

export default OutputAmount
