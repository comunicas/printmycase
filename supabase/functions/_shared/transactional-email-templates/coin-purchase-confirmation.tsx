/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import { Body, Button, Container, Head, Heading, Html, Img, Preview, Section, Text } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const LOGO_URL = 'https://iqnqpwnbdqzvqssxcxgb.supabase.co/storage/v1/object/public/email-assets/logo-printmycase.png'
const APP_URL = 'https://studio.printmycase.com.br'

interface CoinPurchaseConfirmationProps {
  userName?: string
  coinsPurchased?: number
  balanceAfter?: number | null
  expiresAt?: string | null
  orderReference?: string | null
}

const formatDate = (value?: string | null) => {
  if (!value) return null
  try {
    return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long' }).format(new Date(value))
  } catch {
    return null
  }
}

const CoinPurchaseConfirmationEmail = ({
  userName = 'Cliente',
  coinsPurchased = 120,
  balanceAfter = 170,
  expiresAt,
  orderReference = 'cs_test_1234567890',
}: CoinPurchaseConfirmationProps) => {
  const formattedExpiry = formatDate(expiresAt)

  return (
    <Html lang="pt-BR" dir="ltr">
      <Head />
      <Preview>Sua compra de moedas foi confirmada e o saldo já está disponível.</Preview>
      <Body style={main}>
        <Container style={container}>
          <Img src={LOGO_URL} alt="PrintMyCase" height="40" style={logo} />
          <Heading style={h1}>Compra confirmada, {userName}!</Heading>
          <Text style={text}>
            Seu pagamento foi aprovado e as moedas já foram creditadas para usar em filtros IA, upscale e outras criações da sua capinha.
          </Text>
          <Text style={mutedText}>
            Todo o saldo já está disponível na sua conta e você pode começar a usar agora mesmo.
          </Text>

          <Section style={highlightCard}>
            <Text style={highlightLabel}>Moedas creditadas</Text>
            <Text style={highlightValue}>{coinsPurchased} moedas</Text>
            {balanceAfter !== null ? (
              <Text style={detailText}>Saldo após a compra: <strong>{balanceAfter} moedas</strong></Text>
            ) : null}
          </Section>

          <Section style={infoCard}>
            <Text style={detailText}>Referência da compra: <strong>{orderReference}</strong></Text>
            {formattedExpiry ? (
              <Text style={detailText}>Validade deste crédito: <strong>{formattedExpiry}</strong></Text>
            ) : null}
          </Section>

          <Button style={button} href={`${APP_URL}/coins`}>
            Usar minhas moedas
          </Button>

          <Text style={footer}>Se precisar de ajuda com sua compra, responda este email ou fale com sac@printmycase.com.br.</Text>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: CoinPurchaseConfirmationEmail,
  subject: (data: Record<string, any>) => `Compra confirmada: ${data.coinsPurchased ?? 0} moedas`,
  displayName: 'Confirmação de compra de moedas',
  previewData: {
    userName: 'Maria',
    coinsPurchased: 120,
    balanceAfter: 170,
    expiresAt: '2027-04-23T12:00:00.000Z',
    orderReference: 'cs_live_abc123',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Inter', Arial, sans-serif" }
const container = { padding: '32px 25px' }
const logo = { height: '40px', width: 'auto', marginBottom: '24px' }
const h1 = { fontSize: '24px', fontWeight: '700' as const, color: '#19191d', margin: '0 0 12px' }
const text = { fontSize: '14px', color: '#555555', lineHeight: '1.6', margin: '0 0 20px' }
const highlightCard = {
  backgroundColor: 'hsl(265 100% 97%)',
  borderRadius: '16px',
  padding: '24px',
  marginBottom: '20px',
}
const highlightLabel = {
  fontSize: '12px',
  fontWeight: '700' as const,
  letterSpacing: '0.08em',
  textTransform: 'uppercase' as const,
  color: 'hsl(265 83% 57%)',
  margin: '0 0 10px',
}
const highlightValue = {
  fontSize: '30px',
  fontWeight: '700' as const,
  color: '#19191d',
  margin: '0 0 10px',
}
const mutedText = { fontSize: '13px', color: '#6b7280', lineHeight: '1.6', margin: '0 0 20px' }
const infoCard = {
  backgroundColor: '#f8fafc',
  borderRadius: '16px',
  padding: '20px',
  marginBottom: '24px',
  border: '1px solid #e5e7eb',
}
const detailText = { fontSize: '14px', color: '#555555', lineHeight: '1.6', margin: '0 0 10px' }
const button = {
  display: 'inline-block' as const,
  backgroundColor: 'hsl(265 83% 57%)',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: '600' as const,
  borderRadius: '24px',
  padding: '14px 28px',
  textDecoration: 'none',
  margin: '0 0 24px',
}
const footer = { fontSize: '12px', color: '#999999', margin: '0' }