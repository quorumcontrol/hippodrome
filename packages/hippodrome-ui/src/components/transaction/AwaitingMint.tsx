import React from "react"
import { useState } from "react"
import {
  Box,
  VStack,
  Spinner,
  Text,
  Heading,
  Button,
  HStack,
  Image,
  CircularProgress,
  CircularProgressLabel,
} from "@chakra-ui/react"
import { LockAndMint } from "@renproject/ren/build/main/lockAndMint"
import { motion } from "framer-motion"
import { useDeposit } from "../../hooks/useRen"
import { WrappedLockAndMintDeposit } from "../../models/ren"
import Card from "../Card"
import { supportedTokens } from "../../models/tokenList"
import { doSwap } from "../../models/swap"
import { useMemo } from "react"

export interface AwaitingMintProps {
  lockAndMint?: LockAndMint
  deposits?: WrappedLockAndMintDeposit[]
}

const Deposit: React.FC<{ deposit: WrappedLockAndMintDeposit }> = ({
  deposit: propDeposit,
}) => {
  const { deposit, confirmed, confirmations } = useDeposit(propDeposit)
  const [loading, setLoading] = useState(false)

  const progressPercentage = Math.max(
    10,
    ((confirmations?.current || 0) / (confirmations?.target || 1)) * 100
  )

  const selected = useMemo(
    () =>
      supportedTokens.find(
        (t) => t.address === deposit.lockAndMint.params.outputToken
      ),
    [deposit.lockAndMint.params.outputToken]
  )

  const onMint = async () => {
    try {
      setLoading(true)
      console.log("swapping: ", deposit)

      await doSwap(deposit, deposit.lockAndMint.params)

      alert("swapped!")
    } catch (err) {
      console.error("erorr minting: ", err)
    } finally {
      setLoading(false)
    }
  }

  if (confirmed) {
    return (
      <VStack
        padding="2"
        w="100%"
        display="flex"
        flexDirection="column"
        alignItems="center"
      >
        <CircularProgress
          value={progressPercentage}
          size="100px"
          color="rgba(4, 189, 34, 1)"
          thickness="10px"
        >
          <CircularProgressLabel fontSize="sm">
            50 / {confirmations?.target}
          </CircularProgressLabel>
        </CircularProgress>

        <VStack spacing="8" width="100%">
          <Heading marginTop="30px" fontSize="3xl" textAlign="center">
            {deposit.lockAndMint.params.lockNetwork} recieved
          </Heading>

          <Box width="100%">
            <Text color="gray.300">Received</Text>
            <HStack
              justifyContent="space-between"
              width="100%"
              paddingX="6"
              rounded="2xl"
              background="gray.900"
              paddingY="5"
            >
              <HStack>
                <Image w="40px" src={selected?.logoURI} />
                <Text fontSize="lg">{selected?.name}</Text>
              </HStack>

              <Text fontSize="lg" fontWeight="medium">
                2330.35
              </Text>
            </HStack>
            <Text color="white">Price: 1 Dogecoin = 0.43 MATIC</Text>
          </Box>

          <Box width="100%" marginTop="">
            <Text color="gray.300">Reciepient address</Text>
            <Text color="gray.100" fontWeight="medium">
              0xfe9951b3De9eD98c1169ACD1c3f8d2a84418dA40
            </Text>
          </Box>

          <VStack width="100%">
            <HStack width="100%" justifyContent="space-between">
              <Text>FEES</Text>
              <Text>1.2%</Text>
            </HStack>
            <HStack width="100%" justifyContent="space-between">
              <Text>MINERS FEE</Text>
              <Text>5.232 DOGE ($3.43)</Text>
            </HStack>
          </VStack>

          {!loading && (
            <Button width="100%" onClick={onMint}>
              Confirm swap
            </Button>
          )}
        </VStack>

        {loading && <Spinner />}
      </VStack>
    )
  }

  return (
    <VStack spacing="4">
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 2,
          ease: "easeInOut",
          times: [0, 0.5, 1],
          loop: Infinity,
          repeatDelay: 0.25,
        }}
      >
        <CircularProgress
          value={progressPercentage}
          size="120px"
          color="green.400"
        >
          <CircularProgressLabel>
            {confirmations?.current} / {confirmations?.target}
          </CircularProgressLabel>
        </CircularProgress>
      </motion.div>
      <Heading>Waiting for {confirmations?.target} confirmations</Heading>
      {/* TODO: give the user an estimate of time */}
      <Text>
        We need to wait for the miners on the chain to confirm your transaction.
        This could take a little while.
      </Text>
    </VStack>
  )
}

const AwaitingMint: React.FC<AwaitingMintProps> = ({
  lockAndMint,
  deposits,
}) => {
  if (!lockAndMint || !deposits) {
    return null
  }

  console.log("awaiting: ", lockAndMint, deposits)

  return (
    <Card>
      <VStack>
        Awaiting your mint
        {deposits.map((deposit) => {
          return <Deposit deposit={deposit} key={deposit.deposit.txHash()} />
        })}
      </VStack>
    </Card>
  )
}

export default AwaitingMint
