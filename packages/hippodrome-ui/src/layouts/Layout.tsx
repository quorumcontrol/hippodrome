import { Text, Box, Heading, VStack, HStack, Link } from "@chakra-ui/react"
import React from "react"
import { useLocation, Link as RouterLink } from "react-router-dom"
import CurrentUser from "../components/CurrentUser"
import { useChainContext } from "../hooks/useChainContext"

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
    title: "Stake & earn",
    link: "/stake",
  },
]

const Layout: React.FC = ({ children }) => {
  const { address } = useChainContext()
  const location = useLocation()

  return (
    <Box paddingX="20">
      <HStack justifyContent="space-between" w="100%" p={10} mb={4}>
        <Heading size="lg" fontWeight="medium">
          hippodrome
        </Heading>
        <HStack spacing="8">
          {navLinks.map((navlink) => {
            return (
              <Link
                as={RouterLink}
                fontWeight="semibold"
                color={
                  navlink.link === location.pathname ? "brandOrange.500" : "gray.200"
                }
                to={navlink.link}
              >
                {navlink.title}
              </Link>
            )
          })}
        </HStack>
        <CurrentUser />
      </HStack>

      {!address && (
        <VStack>
          <Text>Please connect your wallet</Text>
        </VStack>
      )}
      {address && children}
    </Box>
  )
}

export default Layout
