import { Stack, Text } from '@chakra-ui/react'
import TokenView from 'components/tokenList/tokenView'

export default function Comp(props) {
  const { tokens, user, rest } = props

  return (
    <Stack {...rest}>
      {tokens
        .map((token) => {
          let newToken = Object.assign({}, token)
          return newToken
        })
        .map((token, index) => {
          return (
            <TokenView
              key={`ft-tokenview-${index}`}
              account={user}
              token={token}
            />
          )
        })}
    </Stack>
  )
}
