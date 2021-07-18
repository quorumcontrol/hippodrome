import React, { useCallback, useState } from "react";
import { Box, Text } from "@chakra-ui/layout";
import { Button, Heading, VStack, Link } from "@chakra-ui/react";
import { useChainContext } from "../hooks/useChainContext";

const maticAddChain = {
  "name": "Matic(Polygon) Mainnet",
  "chain": "Matic(Polygon)",
  "network": "mainnet",
  "rpc": [
      "https://rpc-mainnet.matic.network",
      "wss://ws-mainnet.matic.network",
      "https://rpc-mainnet.matic.quiknode.pro",
      "https://matic-mainnet.chainstacklabs.com"
  ],
  "faucets": [],
  "nativeCurrency": {
      "name": "Matic",
      "symbol": "MATIC",
      "decimals": 18
  },
  "infoURL": "https://matic.network/",
  "shortName": "matic",
  "chainId": 137,
  "networkId": 137,
  "explorers": [{
      "name": "polygonscan",
      "url": "https://polygonscan.com",
      "standard": "EIP3091"
  }]
}

const toHex = (num:number) => {
  return '0x'+num.toString(16)
}

const WrongNetwork: React.FC = () => {
  const { chain } = useChainContext()
  const { provider } = chain
  const [errored,setErrored] = useState(false)

  const onClick = useCallback(async () => {
    try {
      setErrored(false)
      await provider!.send('wallet_addEthereumChain', [{
        chainId: toHex(maticAddChain.chainId),
        chainName: maticAddChain.name,
        nativeCurrency: maticAddChain.nativeCurrency,
        rpcUrls: maticAddChain.rpc,
        blockExplorerUrls: maticAddChain.explorers.map((explorer) => explorer.url), 
      }])
    } catch (err) {
      console.error('error adding chain: ', err)
      setErrored(true)
    }
  }, [provider])

  return (
    <VStack>
      <Box bg="black" border="1px" rounded="lg" p="10">
        <VStack spacing="4">
          <Heading>Oops</Heading>
          <Text>
            It looks like you connected your wallet to an unsupported network.
          </Text>
          <Text>Only the Polygon network is supported.</Text>
          {!errored && <Button onClick={onClick}>Switch to Polygon</Button>}
          {errored && (
            <Box>
              <Text>It looks like your wallet doesn't allow automatic adding of networks. <Link textColor="brandOrange.500" href="https://docs.matic.network/docs/develop/metamask/config-polygon-on-metamask">Click here for manual instrucitons.</Link></Text>
            </Box>
          )}
        </VStack>
      </Box>
    </VStack>
  );
};

export default WrongNetwork;
