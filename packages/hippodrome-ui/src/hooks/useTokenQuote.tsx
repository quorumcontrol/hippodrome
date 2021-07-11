import { BigNumber } from "ethers";
import useSWR from "swr";
import { fetchQuote } from "../models/1inch";

// TODO: why are we converting to 10**18 but then back down to 10**8

export const useTokenQuote = (
  input: string,
  output: string,
  amount: string, // 10**18 big number hex encoded
) => {
  console.log("fetching amount for: ", BigNumber.from(amount).div((1e10.toString())).div(1e8).toString());
  const { data, isValidating, revalidate } = useSWR(
    [
      "/1inch-quote",
      input,
      output,
      BigNumber.from(amount).toHexString(),
    ],
    {
      fetcher: async (_, input, output, amtString) => {
        try {
          const amount = BigNumber.from(amtString);
          if (amount.lte(0)) {
            return BigNumber.from(0)
          }
          return fetchQuote(input, output, amount);
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
