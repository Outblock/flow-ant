import { useState } from 'react'
import {
  Box,
  Flex,
  Text,
  Badge,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  SimpleGrid,
} from '@chakra-ui/react'

import { bulkGetNftViews } from 'api'

import NFTView from 'components/nftView'

export default function Collections({
  collections = [],
  onCollectionChange,
  address,
}) {
  const [displayDatas, setDisplayDatas] = useState({})

  const onChange = async (indexs) => {
    for (let index of indexs) {
      const col = collections[index]
      const { path } = col
      if (displayDatas[path] == undefined) {
        const nfts = await bulkGetNftViews(address, col)
        const datas = { ...displayDatas, [path]: nfts }
        setDisplayDatas(datas)
      }
    }
  }

  const loadDisplays = async (idx) => {
    if (collection && account && isValidFlowAddress(account)) {
      const offset = (displays || []).length

      bulkGetNftViews(account, collection, limit, offset)
        .then((data) => {
          setDisplayData(data)
        })
        .catch((e) => {
          const totalTokenIDs = collection.tokenIDs
          const tokenIDs = totalTokenIDs.slice(offset, offset + limit)
          const placeholders = {}
          for (let i = 0; i < tokenIDs.length; i++) {
            const tokenID = tokenIDs[i]
            placeholders[tokenID] = {
              name: collection.contractName,
              description: '',
              thumbnail: { url: '' },
            }
          }
          setDisplayData(placeholders)
          console.error(e)
        })
    }
  }

  const renderItems = (collection, idx) => {
    console.log(collection)
    const {
      contractName,
      contract,
      contractAddress = null,
      tokenIDs,
      type,
      description = '',
      path,
      name,
      display,
      publicPathIdentifier,
    } = collection

    const nftCount = tokenIDs.length

    return (
      <AccordionItem key={idx}>
        <h2>
          <AccordionButton>
            <Box as="span" flex="1" textAlign="left">
              {contractName} {`(${nftCount})`}
            </Box>
            <AccordionIcon />
          </AccordionButton>
        </h2>
        <AccordionPanel pb={4}>
          <Badge mr={4} colorScheme="green" textTransform="inherit">
            <Text as="span" color="green.300">{`Contract Name: `}</Text>
            <Text as="span" color="green.600">{`${contractName}`}</Text>
          </Badge>
          {contractAddress && (
            <Badge
              mr={4}
              textTransform="inherit"
              // onClick={() => {
              //   router.push(`/account/${contractAddress}`)
              // }}
              colorScheme="green"
            >
              <Text as="span" color="green.300">{`Contract Address: `}</Text>
              <Text as="span" color="green.600">{`${contractAddress}`}</Text>
            </Badge>
          )}
          {publicPathIdentifier && (
            <Badge colorScheme="green" textTransform="inherit">
              <Text as="span" color="green.300">{`PublicPath ID: `}</Text>
              <Text as="span" color="green.600">
                {' '}
                {`${publicPathIdentifier}`}{' '}
              </Text>
            </Badge>
          )}
          <Text>{description}</Text>

          <SimpleGrid w="100%" mt={4} columns={3} spacingX="10px" spacingY="20px">
            {Object.keys(displayDatas[path] || {}).map((nftId, ix) => {
              const nfts = displayDatas[path]
              const nftInfo = nfts[nftId]

              const { thumbnail = {} } = nftInfo
              const { url = undefined } = thumbnail

              return (
                <Box
                  key={ix}
                  bg="gray.200"
                  border="1px solid gray"
                  borderRadius="20px"
                  maxW="160px"
                  p={4}
                >
                  <NFTView
                    display={{ ...nftInfo, tokenID: nftId, imageSrc: url }}
                  />
                </Box>
              )
            })}
          </SimpleGrid>
        </AccordionPanel>
      </AccordionItem>
    )
  }

  return (
    <>
      <Accordion allowMultiple onChange={onChange}>
        {collections.map(renderItems)}
      </Accordion>
    </>
  )
}
