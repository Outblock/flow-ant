import { Center, Text, Spinner } from '@chakra-ui/react'

export default function Comp(props) {
  const { tip } = props

  return (
    <Center>
      <Text>
        <Spinner my={4} /> &nbsp;&nbsp; {tip}
      </Text>
    </Center>
  )
}
