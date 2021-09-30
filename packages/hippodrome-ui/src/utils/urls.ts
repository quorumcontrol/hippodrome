export interface MintUrlParams {
  inputToken: string;
  to: string;
  nonce: number;
  swap?: string;
  pool?: string;
  forwardTo?: string;
}

export const mintUrl = ({ inputToken, to, nonce, swap, pool, forwardTo }: MintUrlParams) => {
  if (swap) {
    return `/transaction/mint/${inputToken}/${to}/${nonce}?swap=${swap}&forwardTo=${forwardTo}`;
  }
  return `/transaction/mint/${inputToken}/${to}/${nonce}?pool=${pool}`;
};
