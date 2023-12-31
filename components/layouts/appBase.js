import Head from 'next/head'
import { useState } from 'react'
import { Container, Divider, Box, useMediaQuery } from '@chakra-ui/react'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'

import { fclinit } from 'utils'
import Header from 'components/header'
import { useUserCollection } from 'api/query'
import accountStore from 'stores/account'
import TransferModal from 'components/transferModal'
import PendingTrxModal from 'components/pendingTrxModal'

export default function Layout({ children }) {
  fclinit()
  const { t } = useTranslation()
  const router = useRouter()
  // const { pathname } = router
  const { user = {} } = accountStore.useState('user')
  const { addr = '' } = user

  const { refetch } = useUserCollection(addr)

  // const path = pathname.slice(1)
  const [isPC = true] = useMediaQuery('(min-width: 48em)')

  const renderChildren = () => {
    return <Box>{children}</Box>
  }

  return (
    <>
      <Head>
        <title>Flow Ant</title>
      </Head>
      <main>
        <Container px={['5%', '15%']} w="100%" h="100%" maxW="1440px">
          <Header />

          {/* <Box py={[2, 2, 4]} pr={18}></Box> */}
          {renderChildren()}
        </Container>
        <TransferModal cb={refetch} />
        <PendingTrxModal />
      </main>
    </>
  )
}
