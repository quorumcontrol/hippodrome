import { Heading, Text, VStack, Box, Link } from "@chakra-ui/react"
import React from "react"
import "@fontsource/zen-dots"
import ConnectButton from "./ConnectButton"

const PTGSplashScreen = () => {
  return (
    <VStack paddingX="200px" spacing="16">
      <VStack paddingX="100px" spacing="20">
        <VStack spacing="6">
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
            </Box>{" "}
            or{" "}
            <Box as="span" color="brandOrange.500">
              Dogecoin
            </Box>{" "}
            to get{" "}
            <Box as="span" color="brandOrange.500">
              PTG
            </Box>
          </Heading>
          <Text fontSize="18px" color="gray.200" align="center">
            The cheapest and easiest way to get PTG for gaming on{" "}
            <Link
              href="https://cryptocolosseum.com/"
              target="_blank"
              color="brandOrange.500"
              textDecoration="underline"
              fontWeight="500"
            >
              Crypto Colossuem
            </Link>
          </Text>
        </VStack>
        <ConnectButton text="Swap token now" />
      </VStack>
    </VStack>
  )
}

export default PTGSplashScreen
