/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import { Body, Button, Container, Head, Heading, Html, Img, Preview, Section, Text } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const LOGO_URL = 'https://iqnqpwnbdqzvqssxcxgb.supabase.co/storage/v1/object/public/email-assets/logo-printmycase.png'
const APP_URL = 'https://studio.printmycase.com.br'

interface WelcomeEmailProps {
  userName?: string
  recipientEmail?: string
}

const WelcomeEmail = ({ userName = 'Cliente', recipientEmail = 'cliente@printmycase.com.br' }: WelcomeEmailProps) => (
  <Html lang="pt-BR" dir="ltr">
    <Head />
    <Preview>Sua conta foi confirmada e suas moedas de boas-vindas já estão prontas.</Preview>
    <Body style={main}>
      <Container style={container}>
        <Img src={LOGO_URL} alt="PrintMyCase" height="40" style={logo} />
        <Section style={heroCard}>
          <Text style={eyebrow}>Conta confirmada</Text>
          <Heading style={h1}>Bem-vindo, {userName}!</Heading>
          <Text style={lead}>
            Sua conta na PrintMyCase está pronta para criar capinhas personalizadas com IA, filtros e acabamento final no seu modelo.
          </Text>
        </Section>

        <Section style={infoCard}>
          <Text style={cardTitle}>Seu início já vem turbinado</Text>
          <Text style={text}>
            As moedas de cadastro ficam disponíveis na sua conta para testar estilos, upscale e outras ferramentas criativas assim que você entrar.
          </Text>
          <Text style={text}>
            Email de acesso: <strong>{recipientEmail}</strong>
          </Text>
        </Section>

        <Button style={button} href={`${APP_URL}/coins`}>
          Ver minhas moedas
        </Button>

        <Text style={secondaryText}>
          Quando quiser, também pode ir direto para o catálogo e começar sua personalização.
        </Text>

        <Button style={ghostButton} href={`${APP_URL}/catalog`}>
          Escolher minha capinha
        </Button>

        <Text style={footer}>PrintMyCase — Capas personalizadas com visual único e produção real.</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: WelcomeEmail,
  subject: 'Bem-vindo à PrintMyCase',
  displayName: 'Boas-vindas',
  previewData: {
    userName: 'Maria',
    recipientEmail: 'maria@exemplo.com',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Inter', Arial, sans-serif" }
const container = { padding: '32px 25px' }
const logo = { height: '40px', width: 'auto', marginBottom: '24px' }
const heroCard = {
  backgroundColor: 'hsl(265 100% 97%)',
  borderRadius: '16px',
  padding: '24px',
  marginBottom: '20px',
}
const eyebrow = {
  margin: '0 0 8px',
  fontSize: '12px',
  fontWeight: '700' as const,
  letterSpacing: '0.08em',
  textTransform: 'uppercase' as const,
  color: 'hsl(265 83% 57%)',
}
const h1 = { fontSize: '24px', fontWeight: '700' as const, color: '#19191d', margin: '0 0 12px' }
const lead = { fontSize: '15px', lineHeight: '1.6', color: '#555555', margin: '0' }
const infoCard = {
  backgroundColor: '#f8fafc',
  borderRadius: '16px',
  padding: '20px',
  marginBottom: '24px',
  border: '1px solid #e5e7eb',
}
const cardTitle = { fontSize: '16px', fontWeight: '600' as const, color: '#19191d', margin: '0 0 10px' }
const text = { fontSize: '14px', color: '#555555', lineHeight: '1.6', margin: '0 0 12px' }
const secondaryText = { fontSize: '14px', color: '#555555', lineHeight: '1.6', margin: '0 0 16px' }
const button = {
  display: 'inline-block' as const,
  backgroundColor: 'hsl(265 83% 57%)',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: '600' as const,
  borderRadius: '24px',
  padding: '14px 28px',
  textDecoration: 'none',
  margin: '0 0 16px',
}
const ghostButton = {
  display: 'inline-block' as const,
  backgroundColor: 'hsl(265 100% 97%)',
  color: 'hsl(265 83% 57%)',
  fontSize: '14px',
  fontWeight: '600' as const,
  borderRadius: '24px',
  padding: '14px 28px',
  textDecoration: 'none',
  margin: '0 0 24px',
}
const footer = { fontSize: '12px', color: '#999999', margin: '0' }