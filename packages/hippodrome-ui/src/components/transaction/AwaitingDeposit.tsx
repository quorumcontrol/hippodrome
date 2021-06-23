import React from 'react'
import {
  VStack,
  Heading
} from '@chakra-ui/react'
import QRCode from 'qrcode.react'
import { LockAndMint } from '@renproject/ren/build/main/lockAndMint'

export interface PendingTransactionProps {
  lockAndMint?: LockAndMint
}

const AwaitingDeposit:React.FC<PendingTransactionProps> = ({ lockAndMint }) => {
  
  if (!lockAndMint) {
    return null
  }

  return (
    <VStack>
      <Heading>Please deposit {lockAndMint.params.asset} here: {lockAndMint.gatewayAddress}</Heading>
      <QRCode value={`bitcoin:${lockAndMint.gatewayAddress}`} />
    </VStack>
  )
}

export default AwaitingDeposit