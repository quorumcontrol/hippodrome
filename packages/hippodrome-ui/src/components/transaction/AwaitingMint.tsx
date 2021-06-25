import React from "react";
import { useState } from "react";
import {
  Box,
  VStack,
  Spinner,
  Text,
  Heading,
  Button,
  CircularProgress,
  CircularProgressLabel,
} from "@chakra-ui/react";
import { LockAndMint } from "@renproject/ren/build/main/lockAndMint";
import { motion } from "framer-motion";
import { useDeposit } from "../../hooks/useRen";
import { WrappedLockAndMintDeposit } from "../../models/ren";
import Card from "../Card";
import { doSwap } from "../../models/swap";

export interface AwaitingMintProps {
  lockAndMint?: LockAndMint;
  deposits?: WrappedLockAndMintDeposit[];
}

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
      await doSwap(
        deposit,
        deposit.lockAndMint.params,
      )
      // const tx = await deposit.deposit.queryTx();
      // if (tx.out && !tx.out.revert) {
      //   console.log("amount: ", tx.out.amount.toString());
      //   console.log("nhash: ", tx.out.nhash.toString("hex"));
      //   console.log("phash: ", ((tx.in as any).phash as any).toString('hex'));
      //   console.log("signature: ", tx.out.signature?.toString("hex"));
      // }
      // console.log(tx);

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
            repeatDelay: 0.25
          }}
          >
          <CircularProgress value={progressPercentage} size="120px" color="green.400">
            <CircularProgressLabel>
              {confirmations?.current} / {confirmations?.target}
            </CircularProgressLabel>
          </CircularProgress>
        </motion.div>
        <Heading>Waiting for {confirmations?.target} confirmations</Heading>
        {/* TODO: give the user an estimate of time */}
        <Text>We need to wait for the miners on the chain to confirm your transaction. This could take a little while.</Text>
      </VStack>
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
    <Card>

    <VStack>
      Awaiting your mint
      {deposits.map((deposit) => {
        return <Deposit deposit={deposit} key={deposit.deposit.txHash()} />;
      })}
    </VStack>
    </Card>
  );
};

export default AwaitingMint;
