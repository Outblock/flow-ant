import Head from 'next/head'
import { useState } from 'react'
import {
  Container,
  Divider,
  Center,
  Box,
  Button,
  useMediaQuery,
  useColorMode,
  useTheme,
} from '@chakra-ui/react'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import Spinner from 'react-cli-spinners'

import { fclinit } from '../../utils'
import Header from '../../components/header'
import LoadingPanel from '../loadingPanel'
import accountStore from '../../stores/account'
import { useUserCollection } from '../../api/query'
import { initDomainCollection } from '../../api'
import { toast } from '../../utils'
import PendingTrxModal from 'components/pendingTrxModal'
import migrationStore from 'stores/migration'
import useCurrentUser from '../../hooks/currentUser'

export default function Layout({ children }) {
  fclinit()
  const { t } = useTranslation()
  const router = useRouter()
  const { pathname } = router

  // const path = pathname.slice(1)
  const [isPC = true] = useMediaQuery('(min-width: 48em)')
  const { colorMode } = useColorMode()
  const theme = useTheme()
  const primary =
    colorMode === 'light' ? theme.colors.lightPrimary : theme.colors.primary
  const { user = {} } = accountStore.useState('user')
  const { addr = '' } = user
  const [, isLogin, fcl] = useCurrentUser()

  const { currentStep } = migrationStore.useState('currentStep')

  const {
    data = {},
    refetch,
    isLoading: fetchLoading,
  } = useUserCollection(addr)

  const [loading, setLoading] = useState(false)

  const handleInit = async () => {
    setLoading(true)
    const res = await initDomainCollection()
    if (res == null) {
      refetch()
    } else {
      refetch()
      const { status = 0 } = res
      if (status === 4) {
        toast({
          title: t('init.success'),
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
      }
    }
    setLoading(false)
  }

  const renderConnectPanel = () => {
    return (
      <Center h="calc(100vh - 240px)">
        <Button
          colorScheme="green"
          w="160px"
          borderRadius="full"
          onClick={() => fcl.logIn()}
        >
          {t('connect.tip')}
        </Button>
      </Center>
    )
  }

  const renderChildren = () => {
    // console.log(initState)
    return <Box>{children}</Box>
  }

  return (
    <>
      <Head>
        <title>Flow Ant</title>
      </Head>
      <main>
        <Container px={['5%', '80px']} w="100%" h="100%" maxW="1440px">
          <Header />
          {addr || currentStep >= 1 ? renderChildren() : renderConnectPanel()}
        </Container>
        <PendingTrxModal />
      </main>
    </>
  )
}
