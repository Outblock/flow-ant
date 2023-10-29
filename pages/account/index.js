import React, { useEffect, useState } from 'react'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import ReactGA from 'react-ga'
import { useRouter } from 'next/router'
import {
  Box,
  Text,
  Divider,
  Flex,
  Badge,
  Kbd,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  IconButton,
} from '@chakra-ui/react'
import { MdOutlinePending } from 'react-icons/md'

import Layout from 'components/layouts/app'
import LoadingPanel from 'components/loadingPanel'
import Keys from 'components/keys'
import Empty from 'components/empty'
import { ellipseStr } from 'utils'

import { gaCode } from '../../config/constants'
import accountStore from '../../stores/account'
import { useSharedAccoounts } from 'api/query'
import trxStore from 'stores/trx'

export default function Account() {
  const router = useRouter()
  const { user, accountInfo = {} } = accountStore.useState(
    'user',
    'accountInfo',
  )
  const { t } = useTranslation()

  useEffect(() => {
    ReactGA.initialize(gaCode)
    ReactGA.pageview(window.location.pathname)
  }, [])

  const { keys = [] } = accountInfo
  const currentAddr = user.addr

  return (
    <Box>
      <Text
        fontStyle="italic"
        textDecoration="underline"
        cursor="pointer"
        onClick={() => router.push(`/account/${user.addr}`)}
      >
        {user.addr}
      </Text>
      <Keys keys={keys} m={4} />
    </Box>
  )
}

Account.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>
}

export const getStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
})
