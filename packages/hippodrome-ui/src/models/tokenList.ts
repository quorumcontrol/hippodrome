import quickSwapTokenList from "./quickswapTokenList.json";
import dogeLogo from "../assets/doge-icon.svg";
import bitcoinLogo from "../assets/btc-icon.svg";
import { isTestnet } from './ren'

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

const testDogeAddr = '0xD087b0540e172553c12DEEeCDEf3dFD21Ec02066'
const testBitcoinAddr = '0x880Ad65DC5B3F33123382416351Eef98B4aAd7F1'

export const inputTokens: InputToken[] = [
  {
    name: "Dogecoin",
    logoURI: dogeLogo,
    symbol: "DOGE",
    renAddress: isTestnet ? testDogeAddr : '0xcE829A89d4A55a63418bcC43F00145adef0eDB8E',
  },
  {
    name: "Bitcoin",
    logoURI: bitcoinLogo,
    symbol: "BTC",
    renAddress: isTestnet ? testBitcoinAddr : '0xDBf31dF14B66535aF65AaC99C32e9eA844e14501',
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
