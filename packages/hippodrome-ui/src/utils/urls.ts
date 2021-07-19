export interface MintUrlParams {
  inputToken: string;
  to: string;
  nonce: number;
  swap?: string;
  pool?: string;
}

export const mintUrl = ({ inputToken, to, nonce, swap, pool }: MintUrlParams) => {
  if (swap) {
    return `/transaction/mint/${inputToken}/${to}/${nonce}?swap=${swap}`;
  }
  return `/transaction/mint/${inputToken}/${to}/${nonce}?pool=${pool}`;
};
