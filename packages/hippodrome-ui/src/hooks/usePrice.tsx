import { Client } from '@bandprotocol/bandchain.js'
import useSWR from 'swr';
import { KnownInputChains } from '../models/ren';

// BandChain REST Endpoint
const endpoint = 'https://api-gm-lb.bandchain.org';
const client = new Client(endpoint);

export const usePrice = (inputSymbol:KnownInputChains) => {
  const { data, revalidate, isValidating } = useSWR(['/prices', inputSymbol], {
    fetcher: async (_, inputSymbol) => {
      const rate = await client.getReferenceData([`${inputSymbol}/USD`])
      return rate[0].rate
    },
    dedupingInterval: 30000,
  })
  return {
    rate: data,
    revalidate,
    isValidating,
    loading: !data,
  }
}