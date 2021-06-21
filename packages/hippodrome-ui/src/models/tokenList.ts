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
}

export const inputTokens:InputToken[] = [
  {
    name: 'Dogecoin',
    logoURI: dogeLogo,
  },
  {
    name: 'Bitcoin',
    logoURI: bitcoinLogo,
  }
]

export const supportedTokens:TokenListToken[] = quickSwapTokenList.tokens