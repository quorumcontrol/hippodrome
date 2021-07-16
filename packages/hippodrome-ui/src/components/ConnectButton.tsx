import { Button } from "@chakra-ui/react"
import React from "react"
import { useChainContext } from "../hooks/useChainContext"

const ConnectButton: React.FC<{ text?: string }> = ({
  text = "Connect Wallet",
}) => {
  const { connect } = useChainContext()

  return <Button onClick={connect}>{text}</Button>
}

export default ConnectButton
