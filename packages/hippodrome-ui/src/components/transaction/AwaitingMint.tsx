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
  useToast,
} from "@chakra-ui/react"
import { Jazzicon } from "@ukstv/jazzicon-react"
import SmallText from "../SmallText"
import { LockAndMint } from "@renproject/ren/build/main/lockAndMint"
import { motion } from "framer-motion"
import { BigNumber, utils } from "ethers"
import { useHistory } from "react-router-dom"
import { useDeposit } from "../../hooks/useRen"
import { WrappedLockAndMintDeposit } from "../../models/ren"
import Card from "../Card"
import { inputTokensBySymbol, supportedTokens } from "../../models/tokenList"
import { doSwap } from "../../models/swap"
import { useMemo } from "react"
import { useTokenQuote } from "../../hooks/useTokenQuote"
import { parseValueToHex } from "../../utils/parse"
import humanBigNumber, { formatCurrency } from "../../utils/humanNumbers"
import { centeredTruncateText } from "../../utils/truncateText"
import { useChainContext } from "../../hooks/useChainContext"

export interface AwaitingMintProps {
  lockAndMint?: LockAndMint
  deposits?: WrappedLockAndMintDeposit[]
}

const Deposit: React.FC<{ deposit: WrappedLockAndMintDeposit }> = ({
  deposit: propDeposit,
}) => {
  const { address } = useChainContext()
  const { deposit, confirmed, confirmations } = useDeposit(propDeposit)
  const [loading, setLoading] = useState(false)
  const toast = useToast()
  const history = useHistory()

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

      history.push("/")

      toast({
        title: "Swap completed",
        description: "Check wallet to confirm swap amount",
        duration: 9000,
        status: "success",
      })
    } catch (err) {
      console.error("erorr minting: ", err)
      toast({
        title: "Swap unable to complete",
        description: "Error swapping, token please try again",
        duration: 9000,
        status: "error",
      })
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
        <VStack spacing="10" width="100%">
          <VStack w="100%" spacing="3" alignItems="start">
            <Heading as="h1" fontWeight="" fontSize="2xl">
              {depositAmount} {deposit.lockAndMint.params.lockNetwork} recieved
            </Heading>
            <SmallText fontSize="10" color="gray.400">
              {confirmations?.current} / {confirmations?.target} confirmations
            </SmallText>
          </VStack>

          <Box width="100%">
            <SmallText>Convert to</SmallText>
            <HStack
              justifyContent="space-between"
              width="100%"
              paddingX="6"
              rounded="2xl"
              marginY="2"
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
              <SmallText>
                Price: 1 {deposit.lockAndMint.params.lockNetwork} ={" "}
                {`${conversionRate} ${outputToken?.name}`}
              </SmallText>
            )}
          </Box>

          <Box width="100%" marginTop="">
            <SmallText>Recipient address</SmallText>

            <HStack
              alignItems="center"
              marginTop="3"
              title={deposit.lockAndMint.params.to}
            >
              <Box h={8} w={8}>
                <Jazzicon address={address!} />
              </Box>
              <Text fontWeight="semibold">
                {centeredTruncateText(address!, 15)}
              </Text>
            </HStack>
          </Box>

          <HStack width="100%" justifyContent="space-between">
            <SmallText>FEE</SmallText>
            <Text>
              {fee}(0.15%) {deposit.lockAndMint.params.lockNetwork}
            </Text>
          </HStack>

          {!loading && (
            <Button
              w="100%"
              fontSize="14"
              letterSpacing="wider"
              textTransform="uppercase"
              fontWeight="bold"
              padding="6"
              onClick={onMint}
            >
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
