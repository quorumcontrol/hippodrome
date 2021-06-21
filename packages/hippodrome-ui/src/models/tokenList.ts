import quickSwapTokenList from "./quickswapTokenList.json";
import dogeLogo from "../assets/doge-icon.svg";
import bitcoinLogo from "../assets/btc-icon.svg";

export interface TokenListToken {
  name: string;
  address: string;
  symbol: string;
  decimals: number;
  chainId: number;
  logoURI: string;
}

export interface InputToken {
  name: string;
  logoURI: string;
  symbol: string;
  renAddress: string;
}

export const inputTokens: InputToken[] = [
  {
    name: "Dogecoin",
    logoURI: dogeLogo,
    symbol: "DOGE",
    renAddress: "0xcE829A89d4A55a63418bcC43F00145adef0eDB8E",
  },
  {
    name: "Bitcoin",
    logoURI: bitcoinLogo,
    symbol: "BTC",
    renAddress: "0xDBf31dF14B66535aF65AaC99C32e9eA844e14501",
  },
];

export const inputTokensBySymbol = inputTokens.reduce(
  (mem: Record<string, InputToken>, token) => {
    return { ...mem, [token.symbol]: token };
  },
  {}
);

export const supportedTokens: TokenListToken[] = quickSwapTokenList.tokens;

export const tokenListTokensByAddress = supportedTokens.reduce((mem:Record<string,TokenListToken>, token) => {
  return {...mem, [token.address]:token}
}, {})
