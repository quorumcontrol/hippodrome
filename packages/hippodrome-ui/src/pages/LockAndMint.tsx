import React from "react"
import { VStack, Spinner } from "@chakra-ui/react"
import { useParams } from "react-router-dom"
import { useLockAndMint } from "../hooks/useRen"
import { KnownInputChains } from "../models/ren"
import AwaitingDeposit from "../components/transaction/AwaitingDeposit"
import AwaitingMint from "../components/transaction/AwaitingMint"
import { useQuery } from "../hooks/useQuery"

const Transaction: React.FC = () => {
  const { asset, to, nonce, outputToken } = useParams<{
    asset: KnownInputChains
    to: string
    nonce: string
    outputToken: string
  }>()
  const query = useQuery()

  const value = query.get("swap")

  const { lockAndMint, deposits, loading } = useLockAndMint({
    lockNetwork: asset,
    to,
    nonce: parseInt(nonce),
    outputToken,
  })

  console.log(value)

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
