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
import { inputTokensBySymbol, supportedTokens } from "../../models/tokenList"
import { doSwap } from "../../models/swap"
import { useMemo } from "react"
import { useTokenQuote } from "../../hooks/useTokenQuote"
import { parseValueToHex } from "../../utils/parse"
import humanBigNumber, { formatCurrency } from "../../utils/humanNumbers"
import { BigNumber, utils } from "ethers"

export interface AwaitingMintProps {
  lockAndMint?: LockAndMint
  deposits?: WrappedLockAndMintDeposit[]
}

const Deposit: React.FC<{ deposit: WrappedLockAndMintDeposit }> = ({
  deposit: propDeposit,
}) => {
  const { deposit, confirmed, confirmations } = useDeposit(propDeposit)
  const [loading, setLoading] = useState(false)

  const depositAmount = useMemo(() => {
    return BigNumber.from(deposit.deposit.depositDetails.amount)
      .div(10000 * 10000)
      .toString()
  }, [deposit])

  const { amountOut, loading: tokenQuoteLoading } = useTokenQuote(
    inputTokensBySymbol[deposit.lockAndMint.params.lockNetwork].renAddress,
    deposit.lockAndMint.params.outputToken,
    parseValueToHex(depositAmount)
  )

  const progressPercentage = Math.max(
    10,
    ((confirmations?.current || 0) / (confirmations?.target || 1)) * 100
  )

  const fee = useMemo(() => {
    const nDepositAmount = Number(depositAmount || "0") || 1

    return (nDepositAmount * 0.15) / 100
  }, [depositAmount])

  const conversionRate = useMemo(() => {
    const nOutPutAmount = Number(utils.formatEther(amountOut || 0))
    const nDepositAmount = Number(depositAmount || "0") || 1
    return formatCurrency(nOutPutAmount / nDepositAmount)
  }, [amountOut, depositAmount])

  const outputToken = useMemo(
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
            {confirmations?.target} / {confirmations?.target}
          </CircularProgressLabel>
        </CircularProgress>

        <VStack spacing="8" width="100%">
          <Heading marginTop="30px" fontSize="3xl" textAlign="center">
            {depositAmount} {deposit.lockAndMint.params.lockNetwork} recieved
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
                <Image w="40px" src={outputToken?.logoURI} />
                <Text fontSize="lg">{outputToken?.name}</Text>
              </HStack>

              {tokenQuoteLoading ? (
                <Spinner />
              ) : (
                <Text fontSize="lg" fontWeight="medium">
                  {humanBigNumber(amountOut || "0")}
                </Text>
              )}
            </HStack>
            {!tokenQuoteLoading && (
              <Text color="white">
                Price: 1 {deposit.lockAndMint.params.lockNetwork} ={" "}
                {`${conversionRate} ${outputToken?.name}`}
              </Text>
            )}
          </Box>

          <Box width="100%" marginTop="">
            <Text color="gray.300">Reciepient address</Text>
            <Text color="gray.100" fontWeight="medium">
              {deposit.lockAndMint.params.to}
            </Text>
          </Box>

          <HStack width="100%" justifyContent="space-between">
            <Text>FEE</Text>
            <Text>
              {fee}(0.15%) {deposit.lockAndMint.params.lockNetwork}
            </Text>
          </HStack>

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
