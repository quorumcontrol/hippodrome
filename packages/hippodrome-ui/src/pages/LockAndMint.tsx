import React from "react"
import { VStack, Spinner } from "@chakra-ui/react"
import { useParams } from "react-router-dom"
import { useQuery } from "../hooks/useQuery"
import { useLockAndMint } from "../hooks/useRen"
import { KnownInputChains } from "../models/ren"
import AwaitingDeposit from "../components/transaction/AwaitingDeposit"
import AwaitingMint from "../components/transaction/AwaitingMint"

const Transaction: React.FC = () => {
  const { asset, to, nonce } = useParams<{
    asset: KnownInputChains
    to: string
    nonce: string
  }>()
  const query = useQuery()
  const swap = query.get("swap")
  const forwardTo = query.get("forwardTo") || undefined

  const { lockAndMint, deposits, loading } = useLockAndMint({
    lockNetwork: asset,
    to,
    nonce: parseInt(nonce),
    outputToken: (swap || ''),
    forwardTo,
  })

  if (loading) {
    return (
      <VStack>
        <Spinner />
      </VStack>
    )
  }

  if (deposits.length === 0) {
    return <AwaitingDeposit lockAndMint={lockAndMint} />
  }

  return <AwaitingMint lockAndMint={lockAndMint} deposits={deposits} />
}

export default Transaction
