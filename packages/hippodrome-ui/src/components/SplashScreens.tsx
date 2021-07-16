import { Heading, Text, VStack, Box, Grid, Image } from "@chakra-ui/react"
import React from "react"
import "@fontsource/zen-dots"
import lightRectImage from "../assets/light-rect.svg"
import coinsImage from "../assets/coins.svg"
import ConnectButton from "./ConnectButton"

interface SplashScreenProps {}

const SplashScreen: React.FC<SplashScreenProps> = () => {
  const features = [
    {
      icon: lightRectImage,
      title: (
        <Heading
          as="h3"
          lineHeight="160%"
          padding="22px 0px 12px"
          fontSize="20px"
        >
          Swap{" "}
          <Box as="span" color="brandOrange.500">
            BTC/DOGE
          </Box>{" "}
          for any token on Polygon
        </Heading>
      ),
      description:
        "iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperia",
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
            BTC/DOGE
          </Box>{" "}
          directly into selected liquidity pools and{" "}
          <Box as="span" color="brandOrange.500">
            earn
          </Box>
        </Heading>
      ),
      description: "You’ll be required to send token to a given address ",
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
          Sed ut perspiciatis unde omnis iste natus error sit voluptatem
          accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae
          ab illo inv
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
