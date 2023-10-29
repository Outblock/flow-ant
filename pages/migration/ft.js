/* eslint-disable  */
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import ReactGA from 'react-ga'
import { useRouter } from 'next/router'

import {
  Box,
  Button,
  Center,
  Flex,
  Text,
  Step,
  StepDescription,
  StepIcon,
  StepIndicator,
  StepNumber,
  StepSeparator,
  StepStatus,
  StepTitle,
  Stepper,
  useSteps,
  Spinner,
  useToast,
} from '@chakra-ui/react'

import Layout from '../../components/layouts/app'
import Collections from 'components/collections'
import { gaCode } from '../../config/constants'
import accountStore from '../../stores/account'
import { useAccount } from 'api/query'
import { buildInitScripts, buildTransferScripts } from 'api'
import useCurrentUser from 'hooks/currentUser'

import { ellipseStr, isFlowAddr, formatBalancesData } from 'utils'
import migrationStore from 'stores/migration'
import TokenList from 'components/tokenList'

export default function Migration() {
  const router = useRouter()
  const toast = useToast()

  const [, isLogin, fcl] = useCurrentUser()

  const { user, tokenList = [] } = accountStore.useState('user', 'tokenList')

  // console.log(tokenList, 'tokenList====')
  const { t } = useTranslation()

  const { currentStep, sourceAddr, targetAddr, initScripts, transferScripts } =
    migrationStore.useState(
      'currentStep',
      'sourceAddr',
      'targetAddr',
      'initScripts',
      'transferScripts',
    )

  const steps = [
    { title: t('step.first'), description: t('step.first.desc') },
    { title: t('step.second'), description: t('step.second.desc') },
    { title: t('step.third'), description: t('step.third.desc') },
  ]
  const { activeStep, setActiveStep } = useSteps({
    index: 1,
    count: steps.length,
  })

  useEffect(() => {
    ReactGA.initialize(gaCode)
    ReactGA.pageview(window.location.pathname)
  }, [])

  const { data = {} } = useAccount(user.addr)
  const { keys = [], contracts, vaults = [] } = data

  const [selectedData, setSelectedData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [tokens, setTokens] = useState([])
  const [filteredTokens, setFilteredTokens] = useState([])

  const onCollectionChange = (selectedCollections) => {
    console.log(selectedCollections, 'collections')
    console.log(nftCollections, 'nftCollections')

    let datas = {}
    const paths = Object.keys(selectedCollections)
    let arr = []
    nftCollections.map((col) => {
      const { path } = col
      if (paths.indexOf(path) >= 0) {
        datas[path] = { ...col, selectedTokenIDs: selectedCollections[path] }
        arr = arr.concat(selectedCollections[path])
      }
    })
    setSelectedData(datas)
    // setNFTArr(arr)
  }

  useEffect(() => {
    if (vaults && tokenList) {
      const tokensInfo = formatBalancesData(vaults)
      for (let i = 0; i < tokensInfo.length; i++) {
        const token = tokensInfo[i]
        const registryInfo = tokenList.find((t) => t.id == token.contract)
        if (registryInfo) {
          token.symbol = registryInfo.symbol
          token.logoURL = registryInfo.logoURI
          token.path = registryInfo.path
        }
      }

      const info = tokensInfo
        .map((t) => {
          let order = t.symbol || t.contractName
          // Make sure FLOW is the first one
          if (t.symbol == 'FLOW') order = ''
          return { ...t, order: order }
        })
        .sort((a, b) => a.order.localeCompare(b.order))
      setTokens(info)
    }
  }, [vaults, tokenList])

  const handleStep2 = async () => {
    // build script
    // to step 2
    // fix connect state
    // const res = await buildInitScripts(selectedData)
    if (!selectedData || selectedData == {}) {
      return
    }

    // query resource

    migrationStore.setState({
      selectedData,
      currentStep: 2,
      sourceAddr: user.addr,
    })
    setActiveStep(2)
    fcl.logOut()

    setTimeout(() => {
      fcl.logIn()
    }, 2000)
  }

  const handleInit = async () => {
    setLoading(true)
    try {
      const res = await buildInitScripts(selectedData)
      console.log(res)
      const { status = 0, statusString = '', events } = res
      if (status == 4 || statusString == 'SEALED') {
        const { transactionId } = events[0]
        console.log(transactionId)
        migrationStore.setState({
          selectedData,
          currentStep: 3,
          targetAddr: user.addr,
        })
        setActiveStep(3)
        toast({
          title: t('init.success'),
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
        fcl.logOut()
        setTimeout(() => {
          fcl.logIn()
        }, 2000)
      }

      setLoading(false)
    } catch (err) {
      toast({
        title: t('init.failed'),
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      console.log(err)
      setLoading(false)
    }
  }

  const handleSend = async () => {
    setLoading(true)
    try {
      const res = await buildTransferScripts(selectedData, targetAddr)
      console.log(res)
      const { status = 0, statusString = '', events } = res
      if (status == 4 || statusString == 'SEALED') {
        const { transactionId } = events[0]
        console.log(transactionId)
        router.push(`/account/${targetAddr}`)
      }
      toast({
        title: t('send.success'),
        status: 'success',
        duration: 3000,
        isClosable: true,
      })

      setLoading(false)
    } catch (err) {
      toast({
        title: t('send.failed'),
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      console.log(err)
      setLoading(false)
    }
  }

  const renderPanel = () => {
    if (activeStep == 1) {
      return (
        <Box>
          <Flex mb={8} w="100%" align="center" justify="space-between">
            <Text w="150px" fontWeight={700}>
              {t('step.first')}
            </Text>
            <Flex w="100%" align="center" justify="flex-end">
              {/* {NFTArr.length ? (
                <Text mx={2}>
                  <Text as="span" color="teal" fontWeight={700}>
                    {NFTArr.length}
                  </Text>{' '}
                  {t('nft.selected')}
                </Text>
              ) : (
                <></>
              )} */}
              {/* <Button
                onClick={() => handleStep2()}
                borderRadius="full"
                colorScheme={NFTArr.length > 0 ? 'green' : 'gray'}
                isDisabled={NFTArr.length == 0}
              >
                {t('step.next')}
              </Button> */}
            </Flex>
          </Flex>
          <TokenList tokens={tokens} user={user} />
        </Box>
      )
    } else if (activeStep == 2) {
      return (
        <Center w="100%" h="100%">
          {user.addr ? (
            <Box w="100%">
              <Button
                colorScheme="green"
                borderRadius="full"
                my={4}
                isLoading={loading}
                onClick={handleInit}
              >
                {t('init.collection')}
              </Button>
              <Text as="div">{t('init.collection.tip')}</Text>
            </Box>
          ) : (
            <Box textAlign="center" w="100%">
              <Spinner mb={4} />
              <Flex justify="center" align="center" mb={4}>
                <Text fontSize="25px">{t('connect.with.target')}</Text>
              </Flex>
              <Text fontSize="10px" color="gray.600">
                {t('step.second.tips')}
              </Text>
            </Box>
          )}
        </Center>
      )
    } else {
      return (
        <Center w="100%" h="100%" >
          {user.addr ? (
            <Box>
              <Button
                borderRadius="full"
                colorScheme="green"
                isLoading={loading}
                onClick={handleSend}
                mb={4}
                isDisabled={user.addr != sourceAddr}
              >
                {t('send.nfts')}
              </Button>
              <Text>
                {t('send.nfts.tip', { count: NFTArr.length, addr: targetAddr })}
              </Text>
            </Box>
          ) : (
            <Box textAlign="center" w="100%">
              <Spinner mr={4} />
              <Flex justify="center" align="center" my={4}>
                <Text fontSize="25px">
                  {t('connect.with.source', { addr: sourceAddr })}
                </Text>
              </Flex>
              <Text fontSize="10px" color="gray.600">
                {t('step.third.tips')}
              </Text>
            </Box>
          )}
        </Center>
      )
    }
  }

  return (
    <Flex w="100%" justify="space-between">
      <Box w="67%">{renderPanel()}</Box>
      <Box w="30%">
        <Stepper
          w="100%"
          index={activeStep}
          colorScheme="green"
          orientation="vertical"
          height="400px"
          gap="0"
        >
          {steps.map((step, index) => (
            <Step w="100%" key={index}>
              <StepIndicator>
                <StepStatus
                  complete={<StepIcon />}
                  incomplete={<StepNumber />}
                  active={<StepNumber />}
                />
              </StepIndicator>

              <Box w="100%" flexShrink="0">
                <StepTitle>{step.title}</StepTitle>
                <StepDescription>{step.description}</StepDescription>
              </Box>

              <StepSeparator />
            </Step>
          ))}
        </Stepper>
      </Box>
    </Flex>
  )
}

Migration.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>
}

export const getStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
})
