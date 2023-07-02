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

export default function Collections({
  collections = [],
  onChange = () => {},
  address,
  isDisable = false,
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

  const renderItems = (collection, idx) => {
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

    const nftCount = tokenIDs.length
    const seleNFTs = selectedNFTs[path] || {}
    const displayNFTs = displayDatas[path] || {}
    const isSelectAll = nftCount > 0 && Object.keys(seleNFTs).length == nftCount

    return (
      <>
        <AccordionItem key={idx}>
          <h2>
            <AccordionButton>
              <Box as="span" flex="1" textAlign="left">
                {contractName} {`(${nftCount})`}
              </Box>
              {nftCount > 0 && !isDisable && (
                <Button
                  mx={2}
                  borderRadius="full"
                  colorScheme={isSelectAll ? 'green' : 'gray'}
                  onClick={(e) => {
                    e.preventDefault()
                    handleBatch(path, tokenIDs)
                  }}
                >
                  {t(isSelectAll ? 'cancle.all' : 'select.all')}
                </Button>
              )}
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
                  const { url = undefined } = thumbnail

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

  return (
    <>
      <Accordion allowMultiple>{collections.map(renderItems)}</Accordion>
    </>
  )
}
