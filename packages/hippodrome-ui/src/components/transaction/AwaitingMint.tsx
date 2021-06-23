import React from 'react'
import { useState } from 'react'
import { Box, VStack, Spinner, Text, Button } from '@chakra-ui/react'
import { LockAndMint, LockAndMintDeposit } from '@renproject/ren/build/main/lockAndMint'
import { useDeposit } from '../../hooks/useRen'
import { WrappedLockAndMintDeposit } from '../../models/ren'

export interface AwaitingMintProps {
  lockAndMint?: LockAndMint
  deposits?: WrappedLockAndMintDeposit[]
}

const Deposit:React.FC<{deposit: WrappedLockAndMintDeposit}> = ({ deposit:propDeposit }) => {
  const { deposit, confirmed, confirmations } = useDeposit(propDeposit)
  const [loading, setLoading] = useState(false)

  const onMint = async () => {
    try {
      setLoading(true)
      console.log('deposit: ', deposit)
      const tx = await deposit.deposit.queryTx()
      console.log(tx)
      alert('we now have all the params needed for a mint and a swap')
    } catch (err) {
      console.error('erorr minting: ', err)
    } finally {
      setLoading(false)
    }
  }

  if (confirmed) {
    return (
      <Box>
        <Text>Confirmed!</Text>
        {!loading && <Button onClick={onMint}>Mint</Button>}
        {loading && <Spinner />}
      </Box>
    )
  }

  return (
    <Box>
      <Text>Awaiting network confirmations</Text>
      <VStack>
        <Box>{confirmations?.current} / {confirmations?.target}</Box>
        <Spinner />
      </VStack>
    </Box>
  )
}

const AwaitingMint:React.FC<AwaitingMintProps> = ({ lockAndMint, deposits }) => {
  if (!lockAndMint || !deposits) {
    return null
  }

  console.log('awaiting: ', lockAndMint, deposits)

  return (
    <VStack>
      Awaiting your mint
      {deposits.map((deposit) => {
        return <Deposit deposit={deposit} key={deposit.deposit.txHash()}/>
      })}
    </VStack>
  )
}

export default AwaitingMint