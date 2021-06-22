import React from 'react'
import { useEffect, useState } from 'react'
import { Box, VStack, Spinner, Text, Button } from '@chakra-ui/react'
import { LockAndMint, LockAndMintDeposit } from '@renproject/ren/build/main/lockAndMint'
import ThenArg from '../../utils/ThenArg'
import { useDeposit } from '../../hooks/useRen'
import { getDeposit } from '../../models/ren'

export interface AwaitingMintProps {
  transaction?: LockAndMint
  deposits?: LockAndMintDeposit[]
}

const Deposit:React.FC<{deposit: LockAndMintDeposit}> = ({ deposit:propDeposit }) => {
  const { deposit, confirmed, confirmations } = useDeposit(propDeposit)
  const [loading, setLoading] = useState(false)

  const onMint = async () => {
    try {
      setLoading(true)
      console.log('tx hash: ', deposit.txHash())
      console.log(await getDeposit('BTC', Buffer.from(deposit.txHash(), 'base64')))
      // const res = await deposit.queryTx()
      // console.log('queryTx: ', res)
      // if (res && res.out?.revert) {
      //   await deposit.signed()
      // }
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
      {confirmations?.current} / {confirmations?.target} <Spinner />
    </Box>
  )
}

const AwaitingMint:React.FC<AwaitingMintProps> = ({ transaction, deposits }) => {
  if (!transaction || !deposits) {
    return null
  }

  console.log('awaiting: ', transaction, deposits)

  return (
    <VStack>
      Awaiting your mint
      {deposits.map((deposit) => {
        return <Deposit deposit={deposit} key={deposit.txHash()}/>
      })}
    </VStack>
  )
}

export default AwaitingMint