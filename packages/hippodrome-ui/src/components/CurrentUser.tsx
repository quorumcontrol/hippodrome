import { Text, Box, HStack, useToast } from "@chakra-ui/react"
import React from "react"
import { useChainContext } from "../hooks/useChainContext"
import ConnectButton from "./ConnectButton"
import { Jazzicon } from "@ukstv/jazzicon-react"
import { centeredTruncateText } from "../utils/truncateText"

const CurrentUser: React.FC = () => {
  const { connected, address } = useChainContext()
  const toast = useToast()

  const ClipURLcopyHandler = () => {
    navigator.clipboard.writeText(address || "")

    toast({
      title: "Address copied",
      duration: 4000,
      status: "success",
      position: "bottom-right",
      isClosable: true,
    })
  }

  if (connected) {
    return (
      <HStack
        alignItems="center"
        cursor="copy"
        role="button"
        onClick={ClipURLcopyHandler}
        title={address}
      >
        <Box h={12} w={12}>
          <Jazzicon address={address!} />
        </Box>
        <Text fontWeight="semibold">{centeredTruncateText(address!, 5)}</Text>
      </HStack>
    )
  }

  return <ConnectButton />
}

export default CurrentUser
