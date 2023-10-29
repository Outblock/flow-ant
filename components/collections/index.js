import { useState, useCallback, useEffect } from 'react'
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
  Button,
  Center,
} from '@chakra-ui/react'
import { useTranslation } from 'next-i18next'

import { getCollectionsNFTViews } from 'api'

import NFTView from 'components/nftView'

import { AiFillCheckCircle } from 'react-icons/ai'

export default function Collections({
  collections = [],
  onChange = () => {},
  address,
  isDisable = false,
  nftDatas = {},
  showSelectOnly = false,
}) {
  const { t } = useTranslation()

  const [displayDatas, setDisplayDatas] = useState({})

  const [selectedNFTs, setSelectedNFTs] = useState({})

  useEffect(() => {
    getCollectionsNFTViews(collections, address).then((res) => {
      setDisplayDatas(res)
      
    })
  }, [collections, address])

  const onNFTClick = (path, tokenID) => {
    if (isDisable) {
      return
    }
    const selectedArr = selectedNFTs[path] || []

    const index = selectedArr.indexOf(tokenID)
    if (index >= 0) {
      selectedArr.splice(index, 1)
    } else {
      selectedArr.push(tokenID)
    }

    const data = { ...selectedNFTs, [path]: selectedArr }
    setSelectedNFTs(data)
    onChange(data)
  }

  const handleBatch = (path, ids) => {
    const selectedArr = selectedNFTs[path] || []
    let arr = []
    if (selectedArr.length == ids.length) {
      arr = []
    } else {
      arr = ids
    }
    const data = { ...selectedNFTs, [path]: arr }
    setSelectedNFTs(data)
    onChange(data)
  }

  const renderItems = (collection, idx, filterIds = []) => {
    const {
      contractName,
      contract,
      contractAddress = null,
      tokenIDs = [],
      type,
      description = '',
      path,
      name,
      display,
      publicPathIdentifier,
    } = collection

    let nftCount = filterIds.length > 0 ? filterIds.length : tokenIDs.length
    const seleNFTs = selectedNFTs[path] || {}
    let displayNFTs = displayDatas[path] || {}
    const isSelectAll = nftCount > 0 && Object.keys(seleNFTs).length == nftCount

    if (filterIds && filterIds.length > 0) {
      let selectMap = {}
      filterIds.map((k) => {
        selectMap[k] = displayNFTs[k]
      })
      displayNFTs = selectMap
    }
    return (
      <>
        <AccordionItem key={idx} isDisabled={nftCount == 0}>
          <AccordionButton fontSize="14px" fontWeight={400}>
            <AccordionIcon ml={-4} mr={4} colorScheme="green" />
            <Box as="span" flex="1" textAlign="left">
              {contractName}
              <Badge
                ml={2}
                variant="solid"
                colorScheme="gray"
                lineHeight="24px"
              >
                {nftCount}
              </Badge>
            </Box>

            {nftCount > 0 && !isDisable && !showSelectOnly && (
              <Button
                mx={2}
                borderRadius="full"
                height="24px"
                fontSize="12px"
                colorScheme={isSelectAll ? 'green' : 'gray'}
                onClick={(e) => {
                  e.preventDefault()
                  handleBatch(path, tokenIDs)
                }}
              >
                {isSelectAll ? <AiFillCheckCircle /> : t('select.all')}
              </Button>
            )}
          </AccordionButton>
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
                  {`${publicPathIdentifier}`}{' '}
                </Text>
              </Badge>
            )}
            <Text>{description}</Text>

            {nftCount > 0 ? (
              <SimpleGrid
                w="100%"
                mt={4}
                columns={3}
                spacingX="10px"
                spacingY="20px"
              >
                {Object.keys(displayNFTs).map((nftId, ix) => {
                  const nfts = displayDatas[path]
                  const nftInfo = nfts[nftId]

                  const isSelected =
                    (selectedNFTs[path] || []).indexOf(nftId) >= 0
                  const { thumbnail = {} } = nftInfo
                  console.log(thumbnail)
                  let { url = undefined, cid = undefined } = thumbnail

                  if (cid) {
                    url = `https://ipfs.io/ipfs/${cid}`
                  }

                  return (
                    <>
                      <Box
                        key={ix}
                        bg={isSelected ? 'green.100' : 'gray.200'}
                        cursor="pointer"
                        border="1px solid gray.100"
                        borderRadius="20px"
                        maxW="160px"
                        p={4}
                        onClick={() => onNFTClick(path, nftId)}
                      >
                        <NFTView
                          display={{
                            ...nftInfo,
                            tokenID: nftId,
                            imageSrc: url,
                          }}
                        />
                      </Box>
                    </>
                  )
                })}
              </SimpleGrid>
            ) : (
              <Center h="200px">{t('empty')}</Center>
            )}
          </AccordionPanel>
        </AccordionItem>
      </>
    )
  }

  if (showSelectOnly) {
    const keys = Object.keys(nftDatas)
    const filterCollection = collections.filter(
      (c) => keys.indexOf(c.path) >= 0,
    )
    return (
      <>
        <Accordion allowMultiple>
          {filterCollection.map((col, idx) => {
            const path = col.path
            const tokenIds = nftDatas[path].selectedTokenIDs
            if (tokenIds.length == 0) {
              return null
            }
            return renderItems(col, idx, tokenIds)
          })}
        </Accordion>
      </>
    )
  }

  return (
    <>
      <Accordion allowMultiple>
        {collections.map((c, idx) => renderItems(c, idx))}
      </Accordion>
    </>
  )
}
