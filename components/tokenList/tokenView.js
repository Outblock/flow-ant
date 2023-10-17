import { Flex, Text, Image } from '@chakra-ui/react'

export default function Comp(props) {
  const { token, user } = props

  return (
    <Flex w="100" justify="space-between" p={4}>
      <Image w="40px" src={token.logoURL} alt="" fill />
      <Text>{token.balance}</Text>
    </Flex>
  )
}
