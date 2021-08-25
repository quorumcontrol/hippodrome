import { Heading, Text, VStack, Box, Grid, Image } from "@chakra-ui/react"
import React from "react"
import "@fontsource/zen-dots"
import coinsImage from "../assets/coins.svg"
import ConnectButton from "./ConnectButton"

const SplashScreen = () => {
  const features = [
    {
      icon: coinsImage,
      title: (
        <Heading
          as="h3"
          lineHeight="160%"
          padding="22px 0px 12px"
          fontSize="20px"
        >
          Swap{" "}
          <Box as="span" color="brandOrange.500">
            Bitcoin or Dogecoin
          </Box>{" "}
          for any token on Polygon
        </Heading>
      ),
      description: "Send BTC or DOGE and receive any token on Polygon.",
    },
    {
      icon: coinsImage,
      title: (
        <Heading
          as="h3"
          lineHeight="160%"
          fontSize="20px"
          padding="22px 0px 12px"
        >
          <Box as="span" color="brandOrange.500">
            Zap
          </Box>{" "}
          from{" "}
          <Box as="span" color="brandOrange.500">
            BTC or DOGE
          </Box>{" "}
          directly into selected liquidity pools and{" "}
          <Box as="span" color="brandOrange.500">
            earn
          </Box>
        </Heading>
      ),
      description: "Go directly from BTC or DOGE into interest earning DeFi.",
    },
  ]

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
          Get your{" "}
          <Box as="span" color="brandOrange.500">
            value
          </Box>{" "}
          onto the{" "}
          <Box as="span" color="brandOrange.500">
            Polygon
          </Box>{" "}
          Network
        </Heading>
        <Text fontSize="18px" color="gray.200" align="center">
          The cheapest and easiest way to participate in decentralized finance
          on the Polygon network.
        </Text>
        <ConnectButton text="Swap token now" />
      </VStack>

      <Grid templateColumns="repeat(2, 1fr)" gap={6}>
        {features.map((feature) => (
          <Box
            key={feature.description}
            borderRadius="24px"
            background="cardBackground"
            border="1px solid #261C1A"
            padding="34px"
          >
            <Image src={feature.icon} alt="symbol" />
            {feature.title}
            <Text>{feature.description}</Text>
          </Box>
        ))}
      </Grid>
    </VStack>
  )
}

export default SplashScreen
