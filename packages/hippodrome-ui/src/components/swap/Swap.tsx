import React from "react";
import { VStack, Heading } from "@chakra-ui/react";
import OutputTokenSelect from "./OutputTokenSelect";
import InputTokenSelect from "./InputTokenSelect";

const Swap: React.FC = () => {
  return (
    <VStack w="lg">
      <Heading>You Send</Heading>
      <InputTokenSelect />
      <Heading>You Receive</Heading>
      <OutputTokenSelect />
    </VStack>
  );
};

export default Swap;
