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
  InputGroup,
  InputRightElement,
  Button,
  IconButton,
  Center,
  Text,
  Divider,
  Spinner,
  Badge,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  SliderMark,
} from '@chakra-ui/react'

import * as Yup from 'yup'
import {
  SelectControl,
  NumberInputControl,
  SubmitButton,
  InputControl,
} from 'formik-chakra-ui'
import { Formik } from 'formik'
import Layout from '../../components/layouts/app'
import { gaCode } from '../../config/constants'
import accountStore from '../../stores/account'
import { useAccount } from 'api/query'
import { ellipseStr, isFlowAddr, db } from 'utils'

export default function Create() {
  const router = useRouter()
  const { user } = accountStore.useState('user')
  const { t } = useTranslation()

  useEffect(() => {
    ReactGA.initialize(gaCode)
    ReactGA.pageview(window.location.pathname)
  }, [])

  const { data = {} } = useAccount(user.addr)
  const { keys = [], contracts } = data
  
  return <></>
}

Create.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>
}

export const getStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
})
