import React from "react"
import { Text } from "@chakra-ui/react"

interface SmallTextProps {
  color?: string
  fontSize?: string
}

const SmallText: React.FC<SmallTextProps> = ({
  children,
  color = "gray.300",
  fontSize = "12",
}) => {
  return (
    <Text
      fontWeight="bold"
      textTransform="uppercase"
      fontSize={fontSize}
      letterSpacing="wider"
      color={color}
    >
      {children}
    </Text>
  )
}

export default SmallText
