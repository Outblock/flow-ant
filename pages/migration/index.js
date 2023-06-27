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
    { title: t('step.first'), description: t('step.first.desc') },
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

  const [selectedData, setSelectedData] = useState(null)
  const [loading, setLoading] = useState(false)

  const onCollectionChange = (selectedCollections) => {
    console.log(selectedCollections, 'collections')
    console.log(nftCollections, 'nftCollections')

    let datas = {}
    const paths = Object.keys(selectedCollections)
    nftCollections.map((col) => {
      const { path } = col
      if (paths.indexOf(path) >= 0) {
        datas[path] = { ...col, selectedTokenIDs: selectedCollections[path] }
      }
    })
    setSelectedData(datas)
  }

  const handleStep2 = async () => {
    // build script
    // to step 2
    // fix connect state
    // const res = await buildInitScripts(selectedData)
    if (!selectedData || selectedData == {}) {
      return
    }
    migrationStore.setState({
      selectedData,
      currentStep: 2,
      sourceAddr: user.addr,
    })
    setActiveStep(2)
    fcl.logOut()
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
        fcl.logOut()
      }

      setLoading(false)
    } catch (err) {
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

      setLoading(false)
    } catch (err) {
      console.log(err)
      setLoading(false)
    }
  }

  const renderPanel = () => {
    if (activeStep == 1) {
      return (
        <Box>
          <Flex my={4} w="100%" align="center" justify="space-between">
            <Text>{t('step.first')}</Text>
            <Button onClick={() => handleStep2()}>Next step</Button>
          </Flex>
          <Collections
            collections={nftCollections}
            onChange={onCollectionChange}
            address={user.addr}
          />
        </Box>
      )
    } else if (activeStep == 2) {
      return (
        <Center w="100%" h="100%">
          {user.addr ? (
            <Button isLoading={loading} onClick={handleInit}>
              {t('init.collection')}
            </Button>
          ) : (
            <Box textAlign="center" w="100%">
              <Flex justify="center" align="center">
                <Spinner mr={4} />
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
        <Center w="100%" h="100%">
          {user.addr ? (
            <Button isLoading={loading} onClick={handleSend}>
              {t('send.nfts')}
            </Button>
          ) : (
            <Box textAlign="center" w="100%">
              <Flex justify="center" align="center">
                <Spinner mr={4} />
                <Text fontSize="25px">{t('connect.with.source')}</Text>
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
      <Box w="70%">{renderPanel()}</Box>
      <Box w="20%">
        <Stepper
          w="10%"
          index={activeStep}
          colorScheme="green"
          orientation="vertical"
          height="400px"
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

              <Box flexShrink="0">
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
