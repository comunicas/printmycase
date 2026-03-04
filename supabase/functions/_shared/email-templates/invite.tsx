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
  Text,
} from 'npm:@react-email/components@0.0.22'

interface InviteEmailProps {
  siteName: string
  siteUrl: string
  confirmationUrl: string
}

export const InviteEmail = ({
  siteName,
  siteUrl,
  confirmationUrl,
}: InviteEmailProps) => (
  <Html lang="pt-BR" dir="ltr">
    <Head />
    <Preview>Convite ArtisCase</Preview>
    <Body style={main}>
      <Container style={container}>
        <Img src={logoUrl} alt="ArtisCase" width="140" height="auto" style={logo} />
        <Heading style={h1}>Você foi convidado! 🎉</Heading>
        <Text style={text}>
          Você recebeu um convite para a ArtisCase. Clique no botão abaixo para aceitar e criar sua conta.
        </Text>
        <Button style={button} href={confirmationUrl}>
          Aceitar Convite
        </Button>
        <Text style={footer}>
          Se você não esperava este convite, pode ignorar este email.
        </Text>
        <Text style={brand}>ArtisCase — Capas personalizadas</Text>
      </Container>
    </Body>
  </Html>
)

export default InviteEmail

const logoUrl = 'https://gfsbsgwxylvhnwbpcodj.supabase.co/storage/v1/object/public/email-assets/logo-artiscase.png'
const main = { backgroundColor: '#ffffff', fontFamily: "'Inter', Arial, sans-serif" }
const container = { padding: '40px 25px', maxWidth: '520px', margin: '0 auto' }
const logo = { margin: '0 auto 32px', display: 'block' as const }
const h1 = { fontSize: '22px', fontWeight: 'bold' as const, color: '#1a1a1a', margin: '0 0 16px' }
const text = { fontSize: '15px', color: '#555555', lineHeight: '1.6', margin: '0 0 20px' }
const button = {
  backgroundColor: 'hsl(265, 83%, 57%)',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: '600' as const,
  borderRadius: '1.5rem',
  padding: '14px 32px',
  textDecoration: 'none',
  display: 'inline-block' as const,
}
const footer = { fontSize: '12px', color: '#999999', margin: '30px 0 0' }
const brand = { fontSize: '12px', color: '#aaaaaa', margin: '16px 0 0', textAlign: 'center' as const }
