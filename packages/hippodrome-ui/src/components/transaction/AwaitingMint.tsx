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
import { BigNumber, constants } from "ethers"
import { useHistory } from "react-router-dom"
import { useDeposit, useRenOutput } from "../../hooks/useRen"
import { WrappedLockAndMintDeposit } from "../../models/ren"
import chainInstance from "../../models/chain"
import Card from "../Card"
import { inputTokensBySymbol, supportedTokens } from "../../models/tokenList"
import { doSwap } from "../../models/swap"
import { useMemo } from "react"
import { useTokenQuote } from "../../hooks/useTokenQuote"
import humanBigNumber, { formatCurrency } from "../../utils/humanNumbers"
import { centeredTruncateText } from "../../utils/truncateText"
import { useChainContext } from "../../hooks/useChainContext"
import SwapFees from "../swap/SwapFees"
import { useQuery } from "../../hooks/useQuery"
import StakeOutputTokenAmount from "../stake/StakeOutputTokensAmount"

interface AwaitingMintProps {
  lockAndMint?: LockAndMint
  deposits?: WrappedLockAndMintDeposit[]
}

interface DepositConfirmedProps {
  propDeposit: WrappedLockAndMintDeposit
}

const DepositSwapConfirmed: React.FC<DepositConfirmedProps> = ({
  propDeposit,
}) => {
  const { address } = useChainContext()
  const { deposit, confirmations } = useDeposit(propDeposit)
  const [loading, setLoading] = useState(false)
  const toast = useToast()
  const history = useHistory()

  const networkName = deposit.lockAndMint.params.lockNetwork
  const depositAmount = deposit.deposit.depositDetails.amount

  const humanDepositAmount = useMemo(() => {
    return BigNumber.from(depositAmount).div(1e8).toString()
  }, [depositAmount])

  const { output: renOutput } = useRenOutput(
    deposit.lockAndMint.params.lockNetwork,
    depositAmount
  )

  const { amountOut, loading: tokenQuoteLoading } = useTokenQuote(
    inputTokensBySymbol[networkName].renAddress,
    deposit.lockAndMint.params.outputToken,
    (renOutput || constants.Zero).toHexString() // TODO: do not hard code hex value
  )

  const outputToken = useMemo(
    () =>
      supportedTokens.find(
        (t) => t.address === deposit.lockAndMint.params.outputToken
      ),
    [deposit.lockAndMint.params.outputToken]
  )

  const conversionRate = useMemo(() => {
    if (!outputToken || !amountOut) {
      return "0"
    }
    const decimalDifference = outputToken.decimals - 8
    const paddedInput = BigNumber.from(depositAmount).mul(
      10 ** decimalDifference
    )
    return formatCurrency(paddedInput.div(amountOut).toNumber())
  }, [depositAmount, amountOut, outputToken])

  const onMint = async () => {
    try {
      setLoading(true)
      console.log("swapping: ", deposit)

      await doSwap(deposit, deposit.lockAndMint.params, chainInstance)

      history.push("/")

      toast({
        title: "Swap completed",
        description: "Check wallet to confirm swap amount",
        duration: 9000,
        status: "success",
        isClosable: true,
      })
    } catch (err) {
      console.error("erorr minting: ", err)
      toast({
        title: "Swap unable to complete",
        description: "Error swapping, token please try again",
        duration: 9000,
        status: "error",
        isClosable: true,
      })
    } finally {
      setLoading(false)
    }
  }

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
            {humanDepositAmount} {deposit.lockAndMint.params.lockNetwork}{" "}
            recieved
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
                {humanBigNumber(amountOut || "0", outputToken?.decimals)}
              </Text>
            )}
          </HStack>
          {!tokenQuoteLoading && (
            <SmallText>
              Price before fees: 1 {deposit.lockAndMint.params.lockNetwork} ={" "}
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

        <SwapFees inputName={networkName} amount={depositAmount} />

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

const DepositStakeConfirmed: React.FC<DepositConfirmedProps> = ({
  propDeposit,
}) => {
  const { deposit, confirmations } = useDeposit(propDeposit)
  const [loading, setLoading] = useState(false)
  const toast = useToast()
  const history = useHistory()
  const networkName = deposit.lockAndMint.params.lockNetwork
  const depositAmount = deposit.deposit.depositDetails.amount

  const humanDepositAmount = useMemo(() => {
    return BigNumber.from(depositAmount).div(1e8).toString()
  }, [depositAmount])

  const { output: renOutput } = useRenOutput(
    deposit.lockAndMint.params.lockNetwork,
    depositAmount
  )

  const onStake = async () => {
    try {
      setLoading(true)
      console.log("swapping: ", deposit)

      await doSwap(deposit, deposit.lockAndMint.params, chainInstance)

      history.push("/")

      toast({
        title: "Swap completed",
        description: "Check wallet to confirm swap amount",
        duration: 9000,
        status: "success",
        isClosable: true,
      })
    } catch (err) {
      console.error("erorr minting: ", err)
      toast({
        title: "Swap unable to complete",
        description: "Error swapping, token please try again",
        duration: 9000,
        status: "error",
        isClosable: true,
      })
    } finally {
      setLoading(false)
    }
  }

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
            {humanDepositAmount} {deposit.lockAndMint.params.lockNetwork}{" "}
            recieved
          </Heading>
          <SmallText fontSize="10" color="gray.400">
            {confirmations?.current} / {confirmations?.target} confirmations
          </SmallText>
        </VStack>

        <Box width="100%">
          <SmallText>Token to be staked</SmallText>

          <StakeOutputTokenAmount
            input={inputTokensBySymbol[networkName].renAddress}
            amount={(renOutput || constants.Zero).toHexString()}
          />
        </Box>

        <SwapFees inputName={networkName} amount={depositAmount} />
        <Box w="100%">
          <Text>
            You are about to provide liquidity into the wPTG/renDOGE pool
          </Text>
        </Box>
        {!loading && (
          <Button
            w="100%"
            fontSize="14"
            letterSpacing="wider"
            textTransform="uppercase"
            fontWeight="bold"
            padding="6"
            onClick={onStake}
          >
            Confirm stake
          </Button>
        )}
      </VStack>

      {loading && <Spinner />}
    </VStack>
  )
}

const Deposit: React.FC<{ deposit: WrappedLockAndMintDeposit }> = ({
  deposit: propDeposit,
}) => {
  const { confirmed, confirmations } = useDeposit(propDeposit)
  const query = useQuery()
  const isSwap = query.get("swap") === "true"

  const progressPercentage = Math.max(
    10,
    ((confirmations?.current || 0) / (confirmations?.target || 1)) * 100
  )

  if (confirmed) {
    return isSwap ? (
      <DepositSwapConfirmed propDeposit={propDeposit} />
    ) : (
      <DepositStakeConfirmed propDeposit={propDeposit} />
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
