export const mintUrl = (asset:string, to: string, nonce:number) => {
  return `/transaction/mint/${asset}/${to}/${nonce}`
}