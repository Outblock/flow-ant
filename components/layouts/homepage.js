import Head from 'next/head'
import {
  Container,
  Divider,
  Box,
  Flex,
  Text,
  Center,
  useMediaQuery,
  useColorMode,
  useTheme,
  Alert,
  AlertIcon,
  Link,
} from '@chakra-ui/react'
import { fclinit } from '../../utils'
import Links from '../linkList'
import { partners } from '../../config/constants'
import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/router'

export default function Layout({ children }) {
  fclinit()
  const { t } = useTranslation()
  const [isPC = true] = useMediaQuery('(min-width: 48em)')
  const { colorMode } = useColorMode()
  const router = useRouter()
  const theme = useTheme()
  const primary =
    colorMode === 'light' ? theme.colors.lightPrimary : theme.colors.primary

  return (
    <>
      <Head>
        <title>Migration</title>
      </Head>
      <main>
        <Container w="100%" maxW="1440px" maxH="1600px">
          {children}
        </Container>
      </main>
    </>
  )
}
