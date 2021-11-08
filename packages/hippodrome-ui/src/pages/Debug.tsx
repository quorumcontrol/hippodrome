/* eslint-ignore react-hooks/exhaustive-deps */
import React from "react";
import { VStack, Spinner, HStack, Text } from "@chakra-ui/react";
import { useParams } from "react-router-dom";
import { useDebugger } from "../hooks/useRen";
import { KnownInputChains } from "../models/ren";

const Debug: React.FC = () => {
  const { asset, to, nonce } = useParams<{
    asset: KnownInputChains;
    to: string;
    nonce: string;
  }>();

  const { lockAndMints, loading } = useDebugger({
    lockNetwork: asset,
    to,
    nonce: parseInt(nonce),
    outputToken: "",
    forwardTo: undefined,
  });

  if (loading) {
    return (
      <VStack>
        <Spinner />
      </VStack>
    );
  }

  return (
    <VStack>
      <Text>
        Debug
      </Text>
      {lockAndMints?.map((lm, i) => {
        return (
          <HStack key={`debug-nonce-${i}`}>
            <Text>nonce: {i}</Text>
            <Text>{lm.lockAndMint?.gatewayAddress}</Text>
          </HStack>
        );
      })}
    </VStack>
  );
};

export default Debug;
