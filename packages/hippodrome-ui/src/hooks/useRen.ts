import { BigNumber } from "ethers";
import useSWR from "swr";
import { fetchFees, KnownInputChains, lockAndMint } from "../models/ren";
import { useState, useEffect } from "react";
import { LockAndMintDeposit } from "@renproject/ren/build/main/lockAndMint";
import ThenArg from "../utils/ThenArg";

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

export const useDeposit = (deposit: LockAndMintDeposit) => {
  const [confirmations, setConfirmations] =
    useState<{ current: number; target: number } | undefined>();
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    let canceled = false;

    const confirmed = deposit.confirmed();
    confirmed.on("target", (target) => {
      if (!canceled) {
        setConfirmations((c) => {
          return { ...(c || { current: 0 }), target };
        });
      }
    });

    confirmed.on("confirmation", (current) => {
      if (!canceled) {
        setConfirmations((c) => {
          return { ...(c || { target: 0 }), current };
        });
      }
    });

    confirmed.then(() => {
      if (!canceled) {
        setConfirmed(true);
      }
    });

    return () => {
      canceled = true;
    };
  }, [deposit]);

  return {
    deposit: deposit,
    confirmations,
    confirmed,
  };
};

export const useExistingMintTransaction = (
  assetName: KnownInputChains,
  to: string,
  nonce: number
) => {
  const [deposits, setDeposits] = useState<LockAndMintDeposit[]>([]);

  const {
    data: transaction,
    revalidate,
    isValidating,
  } = useSWR(["/ren-mint-transaction", assetName, to, nonce], {
    fetcher: async (_, assetName, to, nonce) => {
      return lockAndMint(assetName, to, nonce);
    },
  });

  useEffect(() => {
    if (!transaction) {
      return;
    }
    setDeposits([]);
    const cb = (deposit: any) => {
      console.log("deposit: ", deposit);
      setDeposits((c) => [...c, deposit]);
    };
    transaction.on("deposit", cb);
    return () => {
      transaction.off("deposit", cb);
    };
  }, [transaction]);

  return {
    transaction,
    deposits,
    revalidate,
    isValidating,
    loading: !transaction,
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
