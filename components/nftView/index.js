import { Image, Stack, Box, Text } from '@chakra-ui/react'
import { getRarityColor } from 'utils'

export default function NFTView(props) {
  const { display } = props
  const rarityColor = getRarityColor(
    display.rarity ? display.rarity.toLowerCase() : null,
  )
  const defaultImg = `/assets/defaultToken.png`

  return (
    <Stack w="100%" gap={4}>
      <Box border="1px sold gray">
        <Image
          src={display.imageSrc || defaultImg}
          w="128px"
          h="144px"
          objectFit="contain"
          onError={(e) => (e.currentTarget.src = defaultImg)}
        />
        {display.rarity ? <div>{`${display.rarity}`.toUpperCase()}</div> : null}
      </Box>
      <Text>{`${display.name}`}</Text>
      <Text color="gray.300">{`#${display.tokenID}`}</Text>
    </Stack>
  )
}
