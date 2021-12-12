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
  useToast,
} from "@chakra-ui/react"
import { Jazzicon } from "@ukstv/jazzicon-react"
import SmallText from "../SmallText"
import { LockAndMint } from "@renproject/ren/build/main/lockAndMint"
import { BigNumber, constants } from "ethers"
import { useHistory } from "react-router-dom"
import { useParams } from "react-router-dom"
import { useDeposit, useLockAndMint, useRenOutput } from "../../hooks/useRen"
import { KnownInputChains, WrappedLockAndMintDeposit } from "../../models/ren"
import chainInstance from "../../models/chain"
import Card from "../Card"
import { inputTokensBySymbol, supportedTokens } from "../../models/tokenList"
import { doAriSwap } from "../../models/swap"
import { useMemo } from "react"
import { useTokenQuote } from "../../hooks/useTokenQuote"
import humanBigNumber, { formatCurrency } from "../../utils/humanNumbers"
import { centeredTruncateText } from "../../utils/truncateText"
import { useChainContext } from "../../hooks/useChainContext"
import SwapFees from "../swap/SwapFees"
import { useQuery } from "../../hooks/useQuery"

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
  const { address:userSignerAddress } = useChainContext()
  const { deposit, confirmations } = useDeposit(propDeposit)
  const [loading, setLoading] = useState(false)
  const toast = useToast()
  const history = useHistory()

  const networkName = deposit.lockAndMint.params.lockNetwork
  const depositAmount = deposit.deposit.depositDetails.amount

  const forwardTo = deposit.lockAndMint.params.forwardTo || userSignerAddress

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
    if (!outputToken || !amountOut || amountOut.eq(0)) {
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

      await doAriSwap(deposit, deposit.lockAndMint.params, chainInstance)

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
            {humanBigNumber(depositAmount, 8)} {deposit.lockAndMint.params.lockNetwork}{" "}
            received
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
              <Jazzicon address={forwardTo!} />
            </Box>
            <Text fontWeight="semibold">
              {centeredTruncateText(forwardTo!, 15)}
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

const Deposit: React.FC<{ deposit: WrappedLockAndMintDeposit }> = ({
  deposit: propDeposit,
}) => {
  return (<DepositSwapConfirmed propDeposit={propDeposit} />)
}

const AriPage: React.FC = () => {
  const { asset, to, nonce } = useParams<{
    asset: KnownInputChains
    to: string
    nonce: string
  }>()
  const query = useQuery()
  const swap = query.get("swap")
  const forwardTo = query.get("forwardTo") || undefined

  const { deposits, loading } = useLockAndMint({
    lockNetwork: asset,
    to,
    nonce: parseInt(nonce),
    outputToken: (swap || ''),
    forwardTo,
  })

  if (loading) {
    return (
      <VStack>
        <Spinner />
      </VStack>
    )
  }

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

export default AriPage
