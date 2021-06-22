import React from 'react'
import {
  VStack,
  Text,
  Heading
} from '@chakra-ui/react'
import { LockAndMint } from '@renproject/ren/build/main/lockAndMint'
import QRCode from 'qrcode.react'

export interface PendingTransactionProps {
  transaction?: LockAndMint
}

const AwaitingDeposit:React.FC<PendingTransactionProps> = ({ transaction }) => {
  
  if (!transaction) {
    return null
  }

  return (
    <VStack>
      <Heading>Please deposit {transaction.params.asset} here: {transaction.gatewayAddress}</Heading>
      <QRCode value={`bitcoin:${transaction.gatewayAddress}`} />
    </VStack>
  )
}

export default AwaitingDeposit