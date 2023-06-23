/* eslint-disable  */
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import ReactGA from 'react-ga'
import { useRouter } from 'next/router'
import * as fcl from '@onflow/fcl'
import { MinusIcon } from '@chakra-ui/icons'

import {
  Box,
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
} from '@chakra-ui/react'

import Layout from '../../components/layouts/app'
import Collections from 'components/collections'
import { gaCode } from '../../config/constants'
import accountStore from '../../stores/account'
import { useAccount } from 'api/query'

import { ellipseStr, isFlowAddr } from 'utils'

export default function Migration() {
  const router = useRouter()
  const { user } = accountStore.useState('user')
  const { t } = useTranslation()

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

  const onCollectionChange = (collections) => {
    console.log(collections, 'collections')
  }

  const renderPanel = () => {
    if (activeStep == 1) {
      return (
        <Box>
          <Text>{t('step.first')}</Text>
          <Collections
            collections={nftCollections}
            onChange={onCollectionChange}
            address={user.addr}
          />
        </Box>
      )
    } else if (activeStep == 2) {
    } else {
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
