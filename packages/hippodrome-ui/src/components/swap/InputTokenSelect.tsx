import React from "react"
import { InputToken } from "../../models/tokenList"
import {
  HStack,
  Text,
  FormControl,
  PropsOf,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Image,
} from "@chakra-ui/react"
import { ChevronDownIcon } from "@chakra-ui/icons"

interface InputTokenSelectProps {
  onChange: (val: string) => void
  value: string
  selectedToken?: InputToken
  inputTokens: InputToken[]
}

const InputTokenSelect: React.FC<
  Partial<PropsOf<typeof Menu>> & InputTokenSelectProps
> = (userProps) => {
  const { onChange, value, selectedToken, inputTokens, ...menuProps } =
    userProps

  if (!selectedToken) {
    throw new Error("value set to unknown token")
  }

  return (
    <FormControl id="inputToken">
      <Menu {...menuProps}>
        <MenuButton>
          <HStack>
            <Image w="40px" src={selectedToken.logoURI} />
            <Text fontSize="lg">{selectedToken.name}</Text>
            <ChevronDownIcon />
          </HStack>
        </MenuButton>
        <MenuList>
          {inputTokens.map((token) => {
            return (
              <MenuItem
                key={`input-token-${token.name}`}
                onClick={() => onChange(token.symbol)}
              >
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
  )
}

export default InputTokenSelect
