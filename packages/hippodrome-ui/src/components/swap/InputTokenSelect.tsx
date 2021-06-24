import React from "react";
import { inputTokens } from "../../models/tokenList";
import { HStack, Text, FormControl, PropsOf, Menu, MenuButton, MenuList, MenuItem, Image } from "@chakra-ui/react";
import { ChevronDownIcon } from '@chakra-ui/icons'

interface InputTokenSelectProps {
  onChange: (val:string) => void
  value: string
}

const InputTokenSelect: React.FC<Partial<PropsOf<typeof Menu>> & InputTokenSelectProps> = (userProps) => {
  const { onChange, value, ...menuProps } = userProps

  const selected = inputTokens.find((t) => t.symbol === value )

  if (!selected) {
    throw new Error('value set to unknown token')
  }

  return (
    <FormControl id="inputToken">
      <Menu {...menuProps}>
        <MenuButton>
          <HStack>
            <Image w="40px" src={selected.logoURI} />
            <Text fontSize="lg">{selected.name}</Text>
            <ChevronDownIcon />
          </HStack>
        </MenuButton>
        <MenuList>
          {inputTokens.map((token) => {
            return (
              <MenuItem key={`input-token-${token.name}`} onClick={() => onChange(token.symbol)}>
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

export default InputTokenSelect;
