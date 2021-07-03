import React from "react"
import {
  Box,
  VStack,
  HStack,
  Heading,
  Avatar,
  Text,
  Table,
  Thead,
  Tbody,
  Button,
  Tr,
  Th,
  Td,
  TableCaption,
} from "@chakra-ui/react"
import bitcoinLogo from "../assets/btc-icon.svg"

const StakePage: React.FC = () => {
  return (
    <VStack w="100%">
      <Box w="70%" spacing="10" alignItems="start">
        <Heading as="h1" textAlign="center" w="100%">
          Stake Your tokens and Earn
        </Heading>

        <Box w="100%" marginTop="70">
          <Table variant="simple" w="100%">
            <TableCaption>Available pools</TableCaption>
            <Thead>
              <Tr>
                <Th>Pools</Th>
                <Th>Value</Th>
                <Th>action</Th>
              </Tr>
            </Thead>
            <Tbody>
              <Tr>
                <Td>
                  <HStack spacing="4">
                    <Avatar background="white" src={bitcoinLogo} />
                    <Box>
                      <Text
                        marginBottom="4px"
                        fontSize="18px"
                        fontWeight="semibold"
                      >
                        iBTC/WBTC
                      </Text>
                      <Text
                        color="gray.400"
                        fontWeight="medium"
                        fontSize="14px"
                      >
                        SushiSWAP
                      </Text>
                    </Box>
                  </HStack>
                </Td>
                <Td>
                  {" "}
                  <Box>
                    <Text
                      marginBottom="4px"
                      fontSize="14px"
                      fontWeight="semibold"
                    >
                      0.0050.49 iBTC/ 0.334WBTC
                    </Text>
                    <Text color="gray.400" fontWeight="medium" fontSize="14px">
                      $116.39
                    </Text>
                  </Box>
                </Td>
                <Td>
                  <HStack>
                    <Button
                      w="100%"
                      fontWeight="semibold"
                      padding="6"
                      background="transparent"
                      border="1px"
                      color="brandOrange.500"
                      borderColor="gray.600"
                      size="md"
                    >
                      Stake more
                    </Button>
                    <Button
                      w="100%"
                      // fontSize="14"
                      fontWeight="semibold"
                      padding="6"
                      background="transparent"
                      border="1px"
                      borderColor="gray.600"
                      size="md"
                    >
                      Withdraw
                    </Button>
                  </HStack>
                </Td>
              </Tr>
            </Tbody>
          </Table>
        </Box>
      </Box>
    </VStack>
  )
}

export default StakePage
