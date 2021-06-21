import { BigNumber } from "ethers";
import useSWR from "swr";
import { fetchFees, KnownInputChains } from "../models/ren";

export const useRenFees = (networkName:KnownInputChains) => {

  const { data:fees, isValidating, revalidate } = useSWR(['/ren-fees', networkName], {
    fetcher: (_, networkName) => {
      return fetchFees(networkName)
    },
    dedupingInterval: 30000,
  })

  return {
    fees,
    isValidating,
    revalidate,
    loading: !fees,
  }
}

export const useRenOutput = (networkName: KnownInputChains) => {
  const { fees } = useRenFees(networkName)

  const getOutput = (amount:BigNumber) => {
    if (!fees || !fees.lock) {
      throw new Error('fees have not loaded yet')
    }
    return (amount.toNumber() - fees.lock.toNumber() / 1e8) * (10000 - fees.mint) / 10000
  }

  return {
    getOutput,
    loading: !fees,
  }
}
