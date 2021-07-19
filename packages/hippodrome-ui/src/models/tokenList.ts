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

export const supportedTokens: TokenListToken[] = [
  {
    "name": "Dai Stablecoin",
    "address": "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
    "symbol": "DAI",
    "decimals": 18,
    "chainId": 137,
    "logoURI": "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x6B175474E89094C44Da98b954EedeAC495271d0F/logo.png"
  },
  {
    "name": "Ether",
    "address": "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
    "symbol": "ETH",
    "decimals": 18,
    "chainId": 137,
    "logoURI": "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png"
  },
  {
    "name": "Ren BTC",
    "address": "0xDBf31dF14B66535aF65AaC99C32e9eA844e14501",
    "symbol": "renBTC",
    "decimals": 8,
    "chainId": 137,
    "logoURI": "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599/logo.png" // wrapped BTC logo as a placeholder
  },
  {
    "name": "Ren Dogecoin",
    "address": "0xcE829A89d4A55a63418bcC43F00145adef0eDB8E",
    "symbol": "renDOGE",
    "decimals": 8,
    "chainId": 137,
    "logoURI": dogeLogo
  },
  {
    "name": "Wrapped BTC",
    "address": "0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6",
    "symbol": "WBTC",
    "decimals": 8,
    "chainId": 137,
    "logoURI": "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599/logo.png"
  },
  {
    "name": "Wrapped Matic",
    "address": "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
    "symbol": "WMATIC",
    "decimals": 18,
    "chainId": 137,
    "logoURI": "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0/logo.png"
  },
  {
    "name": "Wrapped PTG",
    "address": "0xc0f14c88250e680ecd70224b7fba82b7c6560d12",
    "symbol": "wPTG",
    "decimals": 18,
    "chainId": 137,
    "logoURI": "https://arena.cryptocolosseum.com/images/icons/prestige.svg"
  },
]

export const tokenListTokensByAddress = supportedTokens.reduce((mem:Record<string,TokenListToken>, token) => {
  return {...mem, [token.address.toLowerCase()]:token}
}, {})
