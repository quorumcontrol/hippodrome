import React from 'react'
import { VStack, Spinner } from '@chakra-ui/react'
import { useParams } from 'react-router-dom'
import { useExistingMintTransaction } from '../hooks/useRen'
import { KnownInputChains } from '../models/ren'
import AwaitingDeposit from '../components/transaction/AwaitingDeposit'
import AwaitingMint from '../components/transaction/AwaitingMint'

const Transaction:React.FC = () => {
  const { asset, to, nonce } = useParams<{asset:KnownInputChains, to: string, nonce:string}>()
  const { transaction, deposits, loading } = useExistingMintTransaction(asset, to, parseInt(nonce))

  if (loading) {
    return (
      <VStack>
        <Spinner />
      </VStack>
    )
  }

  if (deposits.length === 0) {
    return (
      <AwaitingDeposit transaction={transaction} />
    )
  }

  return (
    <AwaitingMint transaction={transaction} deposits={deposits} />
  )
}

export default Transaction