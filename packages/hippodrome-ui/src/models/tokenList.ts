import quickSwapTokenList from './quickswapTokenList.json'
import dogeLogo from '../assets/doge-icon.svg'
import bitcoinLogo from '../assets/btc-icon.svg'

export interface TokenListToken {
    name: string
    address: string
    symbol: string
    decimals: number
    chainId: number
    logoURI: string
}

export interface InputToken {
  name: string
  logoURI: string
  symbol: string
}

export const inputTokens:InputToken[] = [
  {
    name: 'Dogecoin',
    logoURI: dogeLogo,
    symbol: 'DOGE',
  },
  {
    name: 'Bitcoin',
    logoURI: bitcoinLogo,
    symbol: 'BTC',
  }
]

export const supportedTokens:TokenListToken[] = quickSwapTokenList.tokens