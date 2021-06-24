import React from "react";
import { supportedTokens } from "../../models/tokenList";
import { HStack, Text, FormControl, PropsOf, Menu, MenuButton, MenuList, MenuItem, Image } from "@chakra-ui/react";
import { ChevronDownIcon } from '@chakra-ui/icons'

interface OutputTokenSelectProps {
  onChange: (val:string) => void
  value: string
}

const OutputTokenSelect: React.FC<Partial<PropsOf<typeof Menu>> & OutputTokenSelectProps> = (userProps) => {
  const { onChange, value, ...menuProps} = userProps

  const selected = supportedTokens.find((t) => t.address === value )

  if (!selected) {
    throw new Error('value set to unknown token')
  }

  return (
    <FormControl id="outputToken">
      <Menu {...menuProps}>
        <MenuButton>
          <HStack>
            <Image w="40px" src={selected.logoURI} />
            <Text fontSize="lg">{selected.name}</Text>
            <ChevronDownIcon />
          </HStack>
        </MenuButton>
        <MenuList>
          {supportedTokens.map((token) => {
            return (
              <MenuItem key={`output-token-${token.address}`} onClick={() => onChange(token.address)}>
                <HStack>
                  <Image w="20px" src={token.logoURI} />
                  <Text fontSize="lg">{token.name}</Text>
                </HStack>
              </MenuItem>
            )
          })}
        </MenuList>
      </Menu>
    </FormControl>
  );
};

export default OutputTokenSelect;
