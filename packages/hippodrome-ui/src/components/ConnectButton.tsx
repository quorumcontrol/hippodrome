import { Button } from '@chakra-ui/react'
import React from 'react'
import { useChainContext } from '../hooks/useChainContext'

const ConnectButton:React.FC = () => {
  const { connect } = useChainContext()

  return (
    <Button onClick={connect}>Connect Wallet</Button>
  )
}

export default ConnectButton