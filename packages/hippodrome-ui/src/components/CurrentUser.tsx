import { Text, Box, HStack } from '@chakra-ui/react'
import React from 'react'
import { useChainContext } from '../hooks/useChainContext'
import ConnectButton from './ConnectButton'
import { Jazzicon } from '@ukstv/jazzicon-react'

const CurrentUser:React.FC = () => {
  const { connected, address } = useChainContext()

  if (connected) {
    return (
      <HStack alignItems="center">
        <Box h={12} w={12}>
          <Jazzicon address={address!} />
        </Box>
        <Text>{address}</Text>
      </HStack>
    )
  }

  return (
    <ConnectButton />
  )

}

export default CurrentUser
