import {
  Stack,
  Text,
  Flex,
  Box,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Button,
} from '@chakra-ui/react'
import TokenView from 'components/tokenList/tokenView'

export default function Comp(props) {
  const { tokens, user, onChange = () => {}, values = {}, ...rest } = props

  return (
    <Stack {...rest}>
      {tokens
        .map((token) => {
          let newToken = Object.assign({}, token)
          return newToken
        })
        .map((token, index) => {
          const value = values[token.contract]
          return (
            <Flex w="100%" justify="space-between">
              <TokenView
                w="60%"
                key={`ft-tokenview-${index}`}
                account={user}
                token={token}
              />
              <Flex w="40%" justify="space-between">
                <NumberInput
                  value={value || ''}
                  defaultValue={''}
                  max={token.balance}
                  keepWithinRange={false}
                  clampValueOnBlur={false}
                  precision={2}
                  onChange={(val) => {
                    onChange(token, val)
                  }}
                >
                  <NumberInputField />
                  {/* <NumberInputStepper></NumberInputStepper> */}
                </NumberInput>
                {value > 0 ? (
                  <Button
                    variant="ghost"
                    isDisabled={token.balance == 0}
                    onClick={() => {
                      onChange(token, '')
                    }}
                    fontSize="10px"
                  >
                    Del
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    isDisabled={token.balance == 0}
                    onClick={() => {
                      onChange(token, token.balance)
                    }}
                    fontSize="10px"
                  >
                    Max
                  </Button>
                )}
              </Flex>
            </Flex>
          )
        })}
    </Stack>
  )
}
