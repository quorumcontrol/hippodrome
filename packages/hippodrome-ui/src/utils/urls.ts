export const mintUrl = (asset:string, to: string, nonce:number, outputToken:string) => {
  return `/transaction/mint/${asset}/${to}/${nonce}/${outputToken}`
}