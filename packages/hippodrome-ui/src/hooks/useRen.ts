import { BigNumber, BigNumberish } from "ethers";
import useSWR from "swr";
import { fetchFees, KnownInputChains, getLockAndMint, LockAndMintParams, WrappedLockAndMintDeposit, amountAfterFees } from "../models/ren";
import { useState, useEffect, useMemo } from "react";
import { LockAndMint } from "@renproject/ren/build/main/lockAndMint";
import { useChainContext } from "./useChainContext";

export const useRenFees = (networkName: KnownInputChains) => {
  const { chain } = useChainContext()
  const {
    data: fees,
    isValidating,
    revalidate,
  } = useSWR(["/ren-fees", networkName], {
    fetcher: async (_, networkName) => {
      try {
        console.log("fetching");
        const fees = await fetchFees(chain, networkName);
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
      setConfirmations({ current: deposit.confirmations || 0, target: deposit.targetConfirmations || 0})
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
  const { chain } = useChainContext()
  const [deposits, setDeposits] = useState<WrappedLockAndMintDeposit[]>([]);
  const [lockAndMint, setLockAndMint] = useState<LockAndMint>()

  const lockAndMintWrapper = useMemo(() => {
    return getLockAndMint(chain, params);
  }, [params, chain])

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

export const useDebugger = (params:LockAndMintParams) => {
  const { chain } = useChainContext()
  const [ready, setReady] = useState(false)

  const lockAndMintWrappers = useMemo(() => {
    console.log('memo')
    return Array(params.nonce).fill(true).map((_, i) => {
      return getLockAndMint(chain, {...params, nonce: i});
    })
  }, [params, chain])

  useEffect(() => {
    Promise.all(lockAndMintWrappers.map((lm) => lm.ready)).then(() => {
      console.log('set ready')
      setReady(true)
    })
  }, [lockAndMintWrappers])

  return {
    lockAndMints: lockAndMintWrappers,
    loading: !ready
  };
};

export const useRenOutput = (networkName: KnownInputChains, amount:BigNumberish) => {
  const { fees } = useRenFees(networkName);

  const getOutput = () => {
    if (!fees || !fees.lock) {
      return undefined
    }
    return amountAfterFees(fees, BigNumber.from(amount))
  };

  return {
    output: getOutput(),
    loading: !fees,
  };
};
