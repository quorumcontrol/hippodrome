import React from "react"
import { TokenListToken } from "../../models/tokenList"
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

interface OutputTokenSelectProps {
  onChange: (val: string) => void
  value: string
  selectedToken?: TokenListToken
  supportedTokens: TokenListToken[]
}

const OutputTokenSelect: React.FC<
  Partial<PropsOf<typeof Menu>> & OutputTokenSelectProps
> = (userProps) => {
  const { onChange, value, supportedTokens, selectedToken, ...menuProps } =
    userProps

  if (!selectedToken) {
    throw new Error("value set to unknown token")
  }

  return (
    <FormControl id="outputToken">
      <Menu {...menuProps}>
        <MenuButton>
          <HStack>
            <Image w="40px" src={selectedToken.logoURI} />
            <Text fontSize="lg">{selectedToken.name}</Text>
            <ChevronDownIcon />
          </HStack>
        </MenuButton>
        <MenuList>
          {supportedTokens.map((token) => {
            return (
              <MenuItem
                key={`output-token-${token.address}`}
                onClick={() => onChange(token.address)}
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

export default OutputTokenSelect
