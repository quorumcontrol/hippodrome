import React from 'react'
import {
  Box,
  VStack,
  Grid,
} from "@chakra-ui/react"
import { ColorModeSwitcher } from "../components/ColorModeSwitcher"
import Swap from "../components/swap/Swap"

const Home:React.FC = () => {
  return (
    <Box textAlign="center" fontSize="xl">
      <Grid minH="100vh" p={3}>
        <ColorModeSwitcher justifySelf="flex-end" />
        <VStack spacing={8}>
          <Swap />
        </VStack>
      </Grid>
    </Box>
  )
}

export default Home
