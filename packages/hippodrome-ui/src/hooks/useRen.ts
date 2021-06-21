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