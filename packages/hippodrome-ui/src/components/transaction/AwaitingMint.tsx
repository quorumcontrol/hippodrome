import React from "react";
import { useState } from "react";
import {
  Box,
  VStack,
  Spinner,
  Text,
  Button,
  CircularProgress,
  CircularProgressLabel,
} from "@chakra-ui/react";
import { LockAndMint } from "@renproject/ren/build/main/lockAndMint";
import { useDeposit } from "../../hooks/useRen";
import { WrappedLockAndMintDeposit } from "../../models/ren";
import { motion } from "framer-motion";

export interface AwaitingMintProps {
  lockAndMint?: LockAndMint;
  deposits?: WrappedLockAndMintDeposit[];
}

const PulsingProgress = motion(CircularProgress);

const Deposit: React.FC<{ deposit: WrappedLockAndMintDeposit }> = ({
  deposit: propDeposit,
}) => {
  const { deposit, confirmed, confirmations } = useDeposit(propDeposit);
  const [loading, setLoading] = useState(false);

  const progressPercentage = Math.max(
    10,
    ((confirmations?.current || 0) / (confirmations?.target || 1)) * 100
  );

  const onMint = async () => {
    try {
      setLoading(true);
      console.log("deposit: ", deposit);
      const tx = await deposit.deposit.queryTx();
      if (tx.out && !tx.out.revert) {
        console.log('amount: ', tx.out.amount.toString())
        console.log('nhash: ', tx.out.nhash.toString('hex'))
        console.log('nhash: ', tx.out.nhash.toString('hex'))
        console.log('signature: ', tx.out.signature?.toString('hex'))
      }
      console.log(tx);

      alert("we now have all the params needed for a mint and a swap");
    } catch (err) {
      console.error("erorr minting: ", err);
    } finally {
      setLoading(false);
    }
  };

  if (confirmed) {
    return (
      <Box>
        <Text>Confirmed!</Text>
        {!loading && <Button onClick={onMint}>Mint</Button>}
        {loading && <Spinner />}
      </Box>
    );
  }

  return (
    <Box>
      <Text>Awaiting network confirmations</Text>
      <VStack>
        <PulsingProgress
          value={progressPercentage}
          color="green.400"
          animate={{
            scale: [1, 1.2, 1],
          }}
        >
          <CircularProgressLabel>
            {confirmations?.current} / {confirmations?.target}
          </CircularProgressLabel>
        </PulsingProgress>
      </VStack>
    </Box>
  );
};

const AwaitingMint: React.FC<AwaitingMintProps> = ({
  lockAndMint,
  deposits,
}) => {
  if (!lockAndMint || !deposits) {
    return null;
  }

  console.log("awaiting: ", lockAndMint, deposits);

  return (
    <VStack>
      Awaiting your mint
      {deposits.map((deposit) => {
        return <Deposit deposit={deposit} key={deposit.deposit.txHash()} />;
      })}
    </VStack>
  );
};

export default AwaitingMint;
