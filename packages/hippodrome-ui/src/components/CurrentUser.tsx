import React from 'react'
import { useChainContext } from '../hooks/useChainContext'
import ConnectButton from './ConnectButton'

const CurrentUser:React.FC = () => {
  const { connected, address } = useChainContext()

  if (connected) {
    return (
      <p>{address}</p>
    )
  }

  return (
    <ConnectButton />
  )

}

export default CurrentUser
