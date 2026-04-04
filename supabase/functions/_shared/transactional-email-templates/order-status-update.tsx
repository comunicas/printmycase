/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const LOGO_URL = 'https://iqnqpwnbdqzvqssxcxgb.supabase.co/storage/v1/object/public/email-assets/logo-printmycase.png'
const APP_URL = 'https://studio.printmycase.com.br'

const statusLabels: Record<string, string> = {
  pending: 'Pagamento Pendente',
  paid: 'Pagamento Confirmado',
  analyzing: 'Analisando Imagem',
  rejected: 'Imagem Recusada',
  producing: 'Produzindo',
  shipped: 'Transporte',
  delivered: 'Entregue',
  cancelled: 'Cancelado',
}

const statusColors: Record<string, string> = {
  pending: '#9ca3af',
  paid: '#22c55e',
  analyzing: '#f59e0b',
  rejected: '#ea580c',
  producing: '#3b82f6',
  shipped: '#06b6d4',
  delivered: '#10b981',
  cancelled: '#ef4444',
}

interface OrderStatusUpdateProps {
  userName?: string
  orderId?: string
  productName?: string
  newStatus?: string
  totalCents?: number
  trackingCode?: string | null
  rejectionReason?: string | null
}

const OrderStatusUpdateEmail = ({
  userName = 'Cliente',
  orderId = '00000000',
  productName = 'Capinha Personalizada',
  newStatus = 'paid',
  totalCents = 0,
  trackingCode,
}: OrderStatusUpdateProps) => {
  const shortId = (orderId || '').slice(0, 8)
  const statusLabel = statusLabels[newStatus || ''] ?? newStatus
  const statusColor = statusColors[newStatus || ''] ?? '#8b5cf6'
  const price = (totalCents || 0) / 100

  return (
    <Html lang="pt-BR" dir="ltr">
      <Head />
      <Preview>Pedido #{shortId} — {statusLabel}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Img src={LOGO_URL} alt="PrintMyCase" height="40" style={logo} />

          <Heading style={h1}>Olá, {userName}!</Heading>
          <Text style={text}>
            Seu pedido <strong>#{shortId}</strong> teve uma atualização de status.
          </Text>

          <Section style={statusCard}>
            <Text style={statusLabelStyle}>Novo Status</Text>
            <Text style={{ ...statusBadge, backgroundColor: statusColor }}>
              {statusLabel}
            </Text>
            <Text style={detailText}>
              Produto: <strong style={{ color: '#19191d' }}>{productName}</strong>
            </Text>
            <Text style={detailText}>
              Total: <strong style={{ color: '#19191d' }}>
                R$ {price.toFixed(2).replace('.', ',')}
              </strong>
            </Text>
          </Section>

          {newStatus === 'shipped' && trackingCode ? (
            <Section style={{ paddingTop: '16px' }}>
              <Text style={detailText}>Código de rastreio:</Text>
              <Text style={trackingCodeStyle}>{trackingCode}</Text>
              <Button
                style={trackingLink}
                href={`https://www.linkcorreios.com.br/?id=${trackingCode}`}
              >
                Rastrear nos Correios →
              </Button>
            </Section>
          ) : null}

          <Button style={button} href={`${APP_URL}/orders`}>
            Ver Meus Pedidos
          </Button>

          <Text style={footer}>PrintMyCase — Capas personalizadas</Text>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: OrderStatusUpdateEmail,
  subject: (data: Record<string, any>) => {
    const shortId = ((data.orderId as string) || '').slice(0, 8)
    const label = statusLabels[(data.newStatus as string) || ''] ?? data.newStatus
    return `Pedido #${shortId} — ${label}`
  },
  displayName: 'Atualização de status do pedido',
  previewData: {
    userName: 'Maria',
    orderId: 'abc12345-def6-7890',
    productName: 'Capinha iPhone 15 Pro',
    newStatus: 'shipped',
    totalCents: 5990,
    trackingCode: 'BR123456789BR',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Inter', Arial, sans-serif" }
const container = { padding: '32px 25px' }
const logo = { height: '40px', width: 'auto', marginBottom: '24px' }
const h1 = {
  fontSize: '20px',
  fontWeight: '600' as const,
  color: '#19191d',
  margin: '0 0 8px',
}
const text = {
  fontSize: '15px',
  color: '#555555',
  lineHeight: '1.5',
  margin: '0 0 24px',
}
const statusCard = {
  backgroundColor: '#f9fafb',
  borderRadius: '12px',
  padding: '20px',
  marginBottom: '24px',
}
const statusLabelStyle = {
  fontSize: '12px',
  color: '#888888',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
  margin: '0 0 8px',
}
const statusBadge = {
  display: 'inline-block' as const,
  padding: '6px 16px',
  borderRadius: '999px',
  fontSize: '14px',
  fontWeight: '600' as const,
  color: '#ffffff',
  margin: '0 0 12px',
}
const detailText = {
  fontSize: '13px',
  color: '#888888',
  margin: '4px 0',
  lineHeight: '1.4',
}
const trackingCodeStyle = {
  fontFamily: 'Courier, monospace',
  fontSize: '16px',
  fontWeight: '600' as const,
  color: '#19191d',
  margin: '0 0 8px',
}
const trackingLink = {
  fontSize: '13px',
  color: 'hsl(265, 83%, 57%)',
  textDecoration: 'none',
  backgroundColor: 'transparent',
  padding: '0',
}
const button = {
  display: 'inline-block' as const,
  backgroundColor: 'hsl(265, 83%, 57%)',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: '600' as const,
  borderRadius: '24px',
  padding: '14px 32px',
  textDecoration: 'none',
  margin: '8px 0 32px',
}
const footer = {
  fontSize: '12px',
  color: '#aaaaaa',
  margin: '24px 0 0',
  paddingTop: '24px',
  borderTop: '1px solid #eeeeee',
  textAlign: 'center' as const,
}
