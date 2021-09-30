import { Heading, Text, VStack, Box } from "@chakra-ui/react"
import React from "react"
import "@fontsource/zen-dots"
import ConnectButton from "./ConnectButton"

const SplashScreen = () => {
  return (
    <VStack paddingX="200px" spacing="16">
      <VStack paddingX="100px" spacing="6">
        <Heading as="h1" fontSize="18px" textTransform="uppercase">
          welcome to hippodrome
        </Heading>
        <Heading
          as="h2"
          fontFamily="zed-dots"
          fontSize="48px"
          fontWeight="normal"
          textAlign="center"
        >
          Swap{" "}
          <Box as="span" color="brandOrange.500">
            Bitcoin
          </Box>
          {" "}or{" "}
          <Box as="span" color="brandOrange.500">
            Dogecoin
          </Box>{" "}
          for tokens on the{" "}
          <Box as="span" color="brandOrange.500">
            Polygon
          </Box>{" "}
          Network
        </Heading>
        <Text fontSize="18px" color="gray.200" align="center">
          The cheapest and easiest way to move value
          onto the Polygon network.
        </Text>
        <ConnectButton text="Get started" />
      </VStack>
    </VStack>
  )
}

export default SplashScreen
