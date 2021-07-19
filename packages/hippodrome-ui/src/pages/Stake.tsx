import React from "react"
import {
  Box,
  VStack,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
} from "@chakra-ui/react"
import { pools } from "../models/poolList"
import StakeRow from "../components/stake/StakeRow"

const StakePage: React.FC = () => {

  return (
    <>
      <VStack w="100%">
        <Box w="70%" spacing="10" alignItems="start">
          <Heading as="h1" textAlign="center" w="100%">
            Add liquidity and earn yield
          </Heading>

          <Box w="100%" marginTop="70">
            <Table variant="simple" w="100%">
              <Thead>
                <Tr bg="black">
                  <Th>Pools</Th>
                  <Th>APY/TVL</Th>
                  <Th>action</Th>
                </Tr>
              </Thead>
              <Tbody>
                {pools.map((pool) => {
                  return <StakeRow pool={pool} key={pool.options.poolAddress}/>
                })}
              </Tbody>
            </Table>
          </Box>
        </Box>
      </VStack>
    </>
  )
}

export default StakePage
