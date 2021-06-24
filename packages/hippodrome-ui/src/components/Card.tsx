import React from 'react'
import {
  Flex,
  Box,
  BoxProps,
} from '@chakra-ui/react'

const Card:React.FC<BoxProps> = (props) => {
  const { children, ...boxProps } = props
  return (
    <Flex alignItems="center" justify="center">
      <Box p="10" borderWidth="1px" rounded="2xl" bg="cardBackground" border="cardBorder" w="xl" {...boxProps}>
        { children }
      </Box>
    </Flex>
  )
}

export default Card
