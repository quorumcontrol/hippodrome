import React from 'react'
import { BigNumber, utils } from 'ethers'
import { useTokenQuote } from '../../hooks/useTokenQuote'
import { Spinner, Box } from '@chakra-ui/react'
import { inputTokensBySymbol, tokenListTokensByAddress } from '../../models/tokenList'

export interface OutputAmountProps {
  input:string
  output:string
  amount:string // bignumber hex
}

const OutputAmount:React.FC<OutputAmountProps> = ({ input, output, amount }) => {
  console.log('amount: ', amount)
  const { amountOut, loading } = useTokenQuote(input, output, BigNumber.from(amount).mul(1e8.toString(10))) // TODO: are all ren tokens 8 decimals?

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
