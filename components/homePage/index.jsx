import React, { useEffect, useState } from 'react'
import {
  Divider,
  Stack,
  Box,
  Text,
  Flex,
  useColorMode,
  useMediaQuery,
  Button,
  Center,
} from '@chakra-ui/react'
import { useRouter } from 'next/router'

import { useTranslation } from 'next-i18next'
import useCurrentUser from '../../hooks/currentUser'

const Component = ({ children }) => {
  const { t } = useTranslation('common')
  const { colorMode } = useColorMode()
  const [isPC = true] = useMediaQuery('(min-width: 48em)')
  const router = useRouter()
  const gradientBg = 'linear-gradient(270deg, #0B6623 7.86%, #21D27D 100%)'
  const [user, isLogin, fcl] = useCurrentUser()

  useEffect(() => {
    if (isLogin) {
      router.push('/account')
    }
  }, [isLogin])

  return (
    <>
      <Stack h={['100%', '100%', 'calc(100vh - 400px)']}>
        <Box
          h={['320px', '320px', '100%']}
          pt={[4, 4, 10]}
          w={['100%', '100%', '100%']}
        >
          <Text h="108px" textColor="#00EF8B" fontSize="48px" fontWeight={700}>
            {t('title')}
          </Text>
          <Text mt={2} mb={8} textStyle="desc">
            {t('title.desc')}
          </Text>
        </Box>

        <Flex justify="space-between">
          <Box m={2} p={8} borderRadius="24px" bg="rgba(0, 0, 0, 0.16)">
            <Text mb={6} textColor="#85E2AD" fontSize="24px" fontWeight={600}>
              {t('step')} 01
            </Text>
            <Text textStyle="desc">{t('step.one')}</Text>
          </Box>
          <Box m={2} p={8} borderRadius="24px" bg="rgba(0, 0, 0, 0.16)">
            <Text mb={6} textColor="#85E2AD" fontSize="24px" fontWeight={600}>
              {t('step')} 02
            </Text>
            <Text textStyle="desc">{t('step.two')}</Text>
          </Box>
          <Box m={2} p={8} borderRadius="24px" bg="rgba(0, 0, 0, 0.16)">
            <Text mb={6} textColor="#85E2AD" fontSize="24px" fontWeight={600}>
              {t('step')} 03
            </Text>
            <Text textStyle="desc">{t('step.three')}</Text>
          </Box>
        </Flex>
        <Center w="100%">
          <Flex
            mt="64px"
            px={4}
            w="100%"
            align="center"
            justify="space-between"
          >
            <Button
              colorScheme="green"
              w="160px"
              borderRadius="full"
              onClick={() => fcl.logIn()}
            >
              {t('connect.tip')}
            </Button>
          </Flex>
        </Center>
      </Stack>
    </>
  )
}
export default Component
