import React from "react";
import { Box, HStack, Text, Button, Tr, Td, useDisclosure } from "@chakra-ui/react";
import { Pool } from "../../models/poolList";
import { useUniswapPool } from "../../hooks/useUniswapPool";
import humanBigNumber from "../../utils/humanNumbers";
import AddLiquidityModal from "./AddLiquidityModal";

interface StakeRowOpts {
  pool: Pool;
}

const StakeRow: React.FC<StakeRowOpts> = ({ pool }) => {

  const { reserves, apy } = useUniswapPool(pool)
  const { isOpen, onOpen, onClose } = useDisclosure()

  return (
    <Tr bg="black">
      <Td>
        <HStack spacing="4">
          <Box>
            <Text marginBottom="4px" fontSize="18px" fontWeight="semibold">
              {pool.pairName()}
            </Text>
            <Text color="gray.400" fontWeight="medium" fontSize="14px">
              {pool.typeName()}
            </Text>
          </Box>
        </HStack>
      </Td>
      <Td>
        <Box>
          <Text marginBottom="4px" fontSize="14px" fontWeight="semibold">
            {pool.options.rewardText ? pool.options.rewardText :`${apy?.toString()}% APY`}
          </Text>
          <Text color="gray.400" fontWeight="medium" fontSize="14px">
            {reserves &&
              humanBigNumber(reserves[pool.token0().address.toLowerCase()], 18)}{" "}
            {pool.token0().name} /{" "}
            {reserves &&
              humanBigNumber(reserves[pool.token1().address.toLowerCase()], 8)}{" "}
            {pool.token1().name}
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
            onClick={onOpen}
          >
            Add Liquidity
          </Button>
        </HStack>
        <AddLiquidityModal pool={pool} isOpen={isOpen} onClose={onClose} />
      </Td>
    </Tr>
  );
};

export default StakeRow;
