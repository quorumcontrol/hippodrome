import { BigNumber, constants } from "ethers";
import axios from "axios";
import { backOff } from "exponential-backoff";

type Address = string;

const BASE_URL = "https://api.1inch.exchange/v3.0/137";
const DEV_ADDRESS = '0x65f3ED6c5F62FA5F9b9Fea704d08A8EAA2998F53'

// see https://docs.1inch.io/api/approve
export const fetchApprove = async (input: Address) => {
  const resp = await fetchWithBackOff("/approve/calldata", {
    tokenAddress: input,
    infinity: true,
  });
  console.log("approved")
  return {
    to: resp.data.to,
    calldata: resp.data.data,
  };
};

// see https://docs.1inch.io/api/quote-swap
export const fetchSwap = async (
  input: Address,
  output: Address,
  amount: BigNumber,
  seller: Address
) => {
  if (input === output) {
    return undefined;
  }

  const params = {
    fromTokenAddress: input,
    toTokenAddress: output,
    disableEstimate: true,
    amount: amount.toString(),
    fromAddress: seller,
    destReceiver: seller,
    referrerAddress: DEV_ADDRESS,
    fee: 0.3,
    slippage: 1, // 1% slippage
  }
  const resp = await fetchWithBackOff("/swap", params);
  return {
    to: resp.data.tx.to,
    calldata: resp.data.tx.data,
    from: resp.data.tx.from,
  };
};

// see https://docs.1inch.io/api/quote-swap
export const fetchQuote = async (
  input: Address,
  output: Address,
  amount: BigNumber,
) => {
  if (amount.eq(0)) {
    return constants.Zero;
  }
  // handle the case where we want to go from DOGE => renDOGE
  if (input === output) {
    return amount;
  }
  const resp = await fetchWithBackOff("/quote", {
    fromTokenAddress: input,
    toTokenAddress: output,
    amount: amount.toString(),
  });
  return BigNumber.from(resp.data.toTokenAmount);
};

const fetchWithBackOff = (path: string, params: any) => {
  return backOff(
    () => {
      return axios.get(`${BASE_URL}${path}`, {
        params,
      });
    },
    {
      maxDelay: 5000,
    }
  );
};
