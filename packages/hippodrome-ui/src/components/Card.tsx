import React from 'react'
import {
  Flex,
  Box,
} from '@chakra-ui/react'

const Card:React.FC = ({ children }) => {
  return (
    <Flex alignItems="center" justify="center">
      <Box p="10" borderWidth="1px" rounded="2xl" bg="cardBackground" border="cardBorder">
        { children }
      </Box>
    </Flex>
  )
}

export default Card
