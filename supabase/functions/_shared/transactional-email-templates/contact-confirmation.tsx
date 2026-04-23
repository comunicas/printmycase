/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import { Body, Container, Head, Heading, Html, Img, Preview, Text } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const LOGO_URL = 'https://iqnqpwnbdqzvqssxcxgb.supabase.co/storage/v1/object/public/email-assets/logo-printmycase.png'

interface ContactConfirmationProps {
  name?: string
}

const ContactConfirmationEmail = ({ name = 'Cliente' }: ContactConfirmationProps) => (
  <Html lang="pt-BR" dir="ltr">
    <Head />
    <Preview>Recebemos sua mensagem e vamos responder em breve.</Preview>
    <Body style={main}>
      <Container style={container}>
        <Img src={LOGO_URL} alt="PrintMyCase" height="40" style={logo} />
        <Heading style={h1}>Olá, {name}!</Heading>
        <Text style={text}>Recebemos sua mensagem com sucesso e nosso time vai retornar o mais breve possível.</Text>
        <Text style={text}>Se precisar complementar algo, é só responder este email ou falar com a gente em sac@printmycase.com.br.</Text>
        <Text style={footer}>PrintMyCase — Capas personalizadas</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: ContactConfirmationEmail,
  subject: 'Recebemos sua mensagem — PrintMyCase',
  displayName: 'Confirmação de contato',
  previewData: { name: 'Maria' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Inter', Arial, sans-serif" }
const container = { padding: '32px 25px' }
const logo = { height: '40px', width: 'auto', marginBottom: '24px' }
const h1 = { fontSize: '22px', fontWeight: '700' as const, color: '#19191d', margin: '0 0 16px' }
const text = { fontSize: '14px', color: '#555555', lineHeight: '1.6', margin: '0 0 16px' }
const footer = { fontSize: '12px', color: '#999999', margin: '24px 0 0' }