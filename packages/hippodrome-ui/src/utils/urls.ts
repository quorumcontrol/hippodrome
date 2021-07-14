export const mintUrl = (
  asset: string,
  to: string,
  nonce: number,
  outputToken: string,
  swap?: boolean
) => {
  return `/transaction/mint/${asset}/${to}/${nonce}/${outputToken}?swap=${swap}`
}
