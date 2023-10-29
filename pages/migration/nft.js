/* eslint-disable  */
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import ReactGA from 'react-ga'
import { useRouter } from 'next/router'
import { BiTransferAlt } from 'react-icons/bi'
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
  Badge,
} from '@chakra-ui/react'

import Layout from '../../components/layouts/app'
import Collections from 'components/collections'
import { gaCode } from '../../config/constants'
import accountStore from '../../stores/account'
import { useAccount } from 'api/query'
import { buildInitScripts, buildTransferScripts } from 'api'
import useCurrentUser from 'hooks/currentUser'

import { ellipseStr, isFlowAddr } from 'utils'
import migrationStore from 'stores/migration'

export default function Migration() {
  const router = useRouter()
  const toast = useToast()

  const [, isLogin, fcl] = useCurrentUser()

  const { user } = accountStore.useState('user')

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
  const { keys = [], contracts, nftCollections = [] } = data

  const [selectedData, setSelectedData] = useState(undefined)
  const [loading, setLoading] = useState(false)
  const [NFTArr, setNFTArr] = useState([])

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
    setNFTArr(arr)
  }

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
    return (
      <Box p={8} bg="rgba(0, 0, 0, 0.16)" borderRadius={4} minH="500px">
        <Flex mb={8} align="center">
          <Text mr={4} textColor="rgba(133, 226, 173, 0.80)" textStyle="h2">
            {t('all.nft')}
          </Text>
          <Badge
            variant="solid"
            colorScheme="green"
            textColor="#85E2AD"
            fontSize="14px"
          >
            {NFTArr.length}
          </Badge>
        </Flex>

        <Collections
          collections={nftCollections}
          onChange={onCollectionChange}
          address={user.addr}
        />
      </Box>
    )
  }

  const renderSelect = () => {
    return (
      <Box
        p={8}
        bg="rgba(0, 0, 0, 0.16)"
        borderRadius={4}
        minH="500px"
        pos="relative"
      >
        <Flex mb={8} align="center">
          <Badge
            variant="solid"
            colorScheme="green"
            textColor="#85E2AD"
            fontSize="14px"
          >
            {NFTArr.length}
          </Badge>
          <Text textStyle="h2" ml={4} textColor="rgba(133, 226, 173, 0.80)">
            {t('selected.nft')}
          </Text>
        </Flex>

        <Collections
          collections={nftCollections}
          nftDatas={selectedData}
          address={user.addr}
          showSelectOnly={true}
        />
        <Flex pos="absolute" w="90%" bottom="18px" justify="flex-end">
          <Button
            onClick={() => handleStep2()}
            borderRadius="full"
            colorScheme={NFTArr.length > 0 ? 'green' : 'gray'}
            isDisabled={NFTArr.length == 0}
          >
            {t('step.next')}
          </Button>
        </Flex>
      </Box>
    )
  }

  return (
    <Box w="100%">
      <Text mb={8} textStyle="title">
        {t('nft.title')}
      </Text>
      <Stepper
        w="100%"
        index={activeStep}
        colorScheme="green"
        orientation="horizontal"
        size="md"
        // height="400px"
        gap="0"
      >
        {steps.map((step, index) => (
          <Step key={index}>
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
      {/* <>
        <Flex mb={8} w="100%" align="center" justify="space-between">
          <Text w="150px" fontWeight={700}>
            {t('step.first')}
          </Text>
          <Flex w="100%" align="center" justify="flex-end">
            {NFTArr.length ? (
              <Text mx={2}>
                <Text as="span" color="teal" fontWeight={700}>
                  {NFTArr.length}
                </Text>{' '}
                {t('nft.selected')}
              </Text>
            ) : (
              <></>
            )}
            <Button
              onClick={() => handleStep2()}
              borderRadius="full"
              colorScheme={NFTArr.length > 0 ? 'green' : 'gray'}
              isDisabled={NFTArr.length == 0}
            >
              {t('step.next')}
            </Button>
          </Flex>
        </Flex>
      </> */}
      {activeStep == 1 && (
        <Flex mt="40px" justify="space-between">
          <Box w="48%" h="500px" overflowY="scroll">
            {renderPanel()}
          </Box>
          <Center minW="40px">
            <BiTransferAlt color="rgba(133, 226, 173, 0.8)" />
          </Center>
          <Box w="48%" h="500px" overflowY="scroll">
            {renderSelect()}
          </Box>
        </Flex>
      )}
      {activeStep == 2 && (
        <Center
          w="100%"
          h="calc(100vh - 340px)"
          mt="40px"
          p={8}
          bg="rgba(0, 0, 0, 0.16)"
          borderRadius={4}
        >
          {user.addr ? (
            <Box textAlign="center" w="100%">
              <Flex w="100%" justify="center">
                <Button
                  colorScheme="green"
                  borderRadius="full"
                  my={4}
                  isLoading={loading}
                  onClick={handleInit}
                >
                  {t('init.collection')}
                </Button>
              </Flex>

              <Text textStyle="h2" as="div">
                {t('init.collection.tip')}
              </Text>
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
      )}
      {activeStep == 3 && (
        <Center
          w="100%"
          h="calc(100vh - 340px)"
          mt="40px"
          p={8}
          bg="rgba(0, 0, 0, 0.16)"
          borderRadius={4}
        >
          {user.addr ? (
            <Box textAlign="center">
              <Button
                borderRadius="full"
                colorScheme="green"
                isLoading={loading}
                onClick={handleSend}
                mb={4}
                isDisabled={user.addr != sourceAddr}
              >
                {t('send.nft')}
              </Button>
              <Text textStyle="h2">
                {t('send.nft.tip', { count: NFTArr.length, addr: targetAddr })}
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
      )}
    </Box>
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
