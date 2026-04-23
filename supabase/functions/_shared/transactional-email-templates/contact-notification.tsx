/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import { Body, Container, Head, Heading, Html, Img, Preview, Section, Text } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const LOGO_URL = 'https://iqnqpwnbdqzvqssxcxgb.supabase.co/storage/v1/object/public/email-assets/logo-printmycase.png'

interface ContactNotificationProps {
  name?: string
  email?: string
  message?: string
}

const ContactNotificationEmail = ({ name = 'Cliente', email = 'cliente@email.com', message = 'Mensagem de exemplo' }: ContactNotificationProps) => (
  <Html lang="pt-BR" dir="ltr">
    <Head />
    <Preview>Nova mensagem recebida pelo formulário de contato.</Preview>
    <Body style={main}>
      <Container style={container}>
        <Img src={LOGO_URL} alt="PrintMyCase" height="40" style={logo} />
        <Heading style={h1}>Novo contato recebido</Heading>
        <Text style={meta}><strong>Nome:</strong> {name}</Text>
        <Text style={meta}><strong>Email:</strong> {email}</Text>
        <Section style={messageCard}>
          <Text style={messageText}>{message}</Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: ContactNotificationEmail,
  subject: (data: Record<string, any>) => `Novo contato no site — ${data.name || 'Cliente'}`,
  displayName: 'Notificação interna de contato',
  to: 'sac@printmycase.com.br',
  previewData: { name: 'Maria', email: 'maria@email.com', message: 'Quero ajuda para escolher a capinha ideal.' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Inter', Arial, sans-serif" }
const container = { padding: '32px 25px' }
const logo = { height: '40px', width: 'auto', marginBottom: '24px' }
const h1 = { fontSize: '22px', fontWeight: '700' as const, color: '#19191d', margin: '0 0 16px' }
const meta = { fontSize: '14px', color: '#555555', lineHeight: '1.6', margin: '0 0 8px' }
const messageCard = { backgroundColor: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: '12px', padding: '16px', marginTop: '16px' }
const messageText = { fontSize: '14px', color: '#4c1d95', lineHeight: '1.6', margin: '0', whiteSpace: 'pre-wrap' as const }