import { BigNumber, constants } from "ethers";
import useSWR from "swr";
import axios from "axios";
import chainInstance from '../models/chain'

export const useTokenQuote = (
  input: string,
  output: string,
  amount: string // 10**18 big number hex encoded
) => {
  console.log("fetching amount for: ", amount);
  const { data, isValidating, revalidate } = useSWR(
    ["/1inch-quote", input, output, BigNumber.from(amount).div(1e10.toString()).toHexString()],
    {
      fetcher: async (_, input, output, amtString) => {
        try {
          const amount = BigNumber.from(amtString);
          if (amount.eq(0)) {
            return constants.Zero;
          }
          const resp = await axios.get(
            `https://api.1inch.exchange/v3.0/${chainInstance.chainId}/quote`,
            {
              // TODO: support mumbai
              params: {
                fromTokenAddress: input,
                toTokenAddress: output,
                amount: amount.toString(),
              },
            }
          );
          return BigNumber.from(resp.data.toTokenAmount);
        } catch (err) {
          console.error("error fetching 1inch quote: ", err);
          throw err;
        }
      },
    }
  );

  return {
    amountOut: data,
    isValidating,
    revalidate,
    loading: !data,
  };
};
