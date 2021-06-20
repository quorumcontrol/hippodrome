import React from 'react'
import {
  Box,
  Text,
  VStack,
  Grid,
} from "@chakra-ui/react"
import { ColorModeSwitcher } from "../components/ColorModeSwitcher"
import { Logo } from "../components/Logo"

const Home:React.FC = () => {
  return (
    <Box textAlign="center" fontSize="xl">
      <Grid minH="100vh" p={3}>
        <ColorModeSwitcher justifySelf="flex-end" />
        <VStack spacing={8}>
          <Logo h="40vmin" pointerEvents="none" />
          <Text>
            hi
          </Text>
        </VStack>
      </Grid>
    </Box>
  )
}

export default Home
