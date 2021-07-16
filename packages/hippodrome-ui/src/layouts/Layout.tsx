import {
  Text,
  Box,
  Image,
  HStack,
  Link,
  Heading,
} from "@chakra-ui/react"
import React from "react"
import { useLocation, Link as RouterLink } from "react-router-dom"
import CurrentUser from "../components/CurrentUser"
import { useChainContext } from "../hooks/useChainContext"
import logoURl from "../assets/logo.png"
import backgroundURL from "../assets/app-bg.png"
import SplashScreen from "../components/SplashScreens"


interface NavLink {
  title: string
  link: "/stake" | "/"
}

const navLinks: NavLink[] = [
  {
    title: "Swap",
    link: "/",
  },
  {
    title: "earn",
    link: "/stake",
  },
]

const Layout: React.FC = ({ children }) => {
  const { address } = useChainContext()
  const location = useLocation()

  return (
    <Box paddingX="20" backgroundImage={backgroundURL} backgroundRepeat="no-repeat" backgroundPosition="bottom" backgroundSize="cover" minHeight="100vh">
      <HStack justifyContent="space-between" w="100%" p={10} mb={4}>
        <HStack alignItems="flex-end">
          <Image src={logoURl} width="60px" fontWeight="medium" />
          <Heading
            fontSize="xl"
            as="h1"
            fontFamily="monospace"
            fontWeight="medium"
          >
            hippodrome
          </Heading>
          <Text fontSize="10" color="gray.200" marginTop="-20px">
            Beta
          </Text>
        </HStack>
        <HStack spacing="8">
          {navLinks.map((navlink) => {
            return (
              <Link
                key={`navlink-${navlink.link}`}
                as={RouterLink}
                to={navlink.link}
                fontWeight="bold"
                textTransform="uppercase"
                fontSize="13"
                letterSpacing="wider"
                color={
                  navlink.link === location.pathname
                    ? "brandOrange.500"
                    : "gray.300"
                }
              >
                {navlink.title}
              </Link>
            )
          })}
        </HStack>
        <CurrentUser />
      </HStack>

      {!address && <SplashScreen />}
      {address && children}
    </Box>
  )
}

export default Layout
