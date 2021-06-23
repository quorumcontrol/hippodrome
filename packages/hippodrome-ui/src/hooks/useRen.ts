import { BigNumber } from "ethers";
import useSWR from "swr";
import { fetchFees, KnownInputChains, getLockAndMint, LockAndMintParams, WrappedLockAndMintDeposit } from "../models/ren";
import { useState, useEffect, useMemo } from "react";
import { LockAndMint } from "@renproject/ren/build/main/lockAndMint";

export const useRenFees = (networkName: KnownInputChains) => {
  const {
    data: fees,
    isValidating,
    revalidate,
  } = useSWR(["/ren-fees", networkName], {
    fetcher: async (_, networkName) => {
      try {
        console.log("fetching");
        const fees = await fetchFees(networkName);
        console.log("fees: ", fees);
        return fees;
      } catch (err) {
        console.error("error fetching ren fees: ", err);
        throw err;
      }
    },
    dedupingInterval: 30000,
  });

  return {
    fees,
    isValidating,
    revalidate,
    loading: !fees,
  };
};

export const useDeposit = (deposit: WrappedLockAndMintDeposit) => {
  const [confirmations, setConfirmations] =
    useState<{ current: number; target: number } | undefined>(
      (deposit.confirmations && deposit.targetConfirmations) ? 
        { current: deposit.confirmations, target: deposit.targetConfirmations } :
        undefined
    );
  const [confirmed, setConfirmed] = useState(deposit.confirmed);
  const [signed, setSigned] = useState(deposit.signed)

  useEffect(() => {
    const cb = () => {
      setConfirmations({ current: deposit.confirmations || 0, target: deposit.confirmations || 0})
      setConfirmed(deposit.confirmed)
      setSigned(deposit.signed)
    }

    deposit.on('update', cb)

    return () => {
      deposit.off('update', cb)
    };
  }, [deposit]);

  return {
    deposit: deposit,
    confirmations,
    confirmed,
    signed,
  };
};

export const useLockAndMint = (params:LockAndMintParams) => {
  const [deposits, setDeposits] = useState<WrappedLockAndMintDeposit[]>([]);
  const [lockAndMint, setLockAndMint] = useState<LockAndMint>()

  const lockAndMintWrapper = useMemo(() => {
    return getLockAndMint(params);
  }, [params])

  useEffect(() => {
    setDeposits([...lockAndMintWrapper.deposits]);
    lockAndMintWrapper.ready.then((lockAndMint) => {
      setLockAndMint(lockAndMint)
    })
    const cb = (deposit: WrappedLockAndMintDeposit) => {
      console.log("deposit: ", deposit);
      setDeposits((c) => [...c, deposit]);
    };
    lockAndMintWrapper.on("deposit", cb);
    return () => {
      lockAndMintWrapper.off("deposit", cb);
    };
  }, [lockAndMintWrapper]);

  return {
    lockAndMint,
    deposits,
    loading: !lockAndMint
  };
};

export const useRenOutput = (networkName: KnownInputChains) => {
  const { fees } = useRenFees(networkName);

  const getOutput = (amount: BigNumber) => {
    if (!fees || !fees.lock) {
      throw new Error("fees have not loaded yet");
    }
    return (
      ((amount.toNumber() - fees.lock.toNumber() / 1e8) * (10000 - fees.mint)) /
      10000
    );
  };

  return {
    getOutput,
    loading: !fees,
  };
};
