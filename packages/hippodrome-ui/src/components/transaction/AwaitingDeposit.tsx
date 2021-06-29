import React from "react";
import { VStack, Heading, Text } from "@chakra-ui/react";
import QRCode from "qrcode.react";
import { LockAndMint } from "@renproject/ren/build/main/lockAndMint";
import Card from "../Card";

export interface PendingTransactionProps {
  lockAndMint?: LockAndMint;
}

const AwaitingDeposit: React.FC<PendingTransactionProps> = ({
  lockAndMint,
}) => {
  if (!lockAndMint) {
    return null;
  }

  return (
    <Card>
      <VStack spacing="8">
        <Heading>Send {lockAndMint.params.asset} to</Heading>
        <VStack spacing="2">
          {/* TODO: add the copy button and background color */}
          <Text>{lockAndMint.gatewayAddress}</Text>
          <QRCode value={`bitcoin:${lockAndMint.gatewayAddress}`} />
        </VStack>
        <Text>
          Once you deposit {lockAndMint.params.asset}, this page will
          change.
        </Text>
      </VStack>
    </Card>
  )
};

export default AwaitingDeposit;
