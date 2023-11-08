import { Flex, Text, Image } from '@chakra-ui/react'

export default function Comp(props) {
  const { token, user, ...rest } = props

  const { balance = '0' } = token
  return (
    <Flex w="100%" h="30px" justify="space-between" p={2}>
      <Image w="20px" src={token.logoURL} alt="" fill />
      <Text as="div">{token.symbol}</Text>
      <Text as="div" fontSize="12px">
        {Number(balance).toFixed(2)}
      </Text>
    </Flex>
  )
}
