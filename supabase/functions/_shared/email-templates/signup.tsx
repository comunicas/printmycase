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
  Link,
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface SignupEmailProps {
  siteName: string
  siteUrl: string
  recipient: string
  confirmationUrl: string
}

export const SignupEmail = ({
  siteName,
  siteUrl,
  recipient,
  confirmationUrl,
}: SignupEmailProps) => (
  <Html lang="pt-BR" dir="ltr">
    <Head />
    <Preview>Confirme sua conta ArtisCase</Preview>
    <Body style={main}>
      <Container style={container}>
        <Img src={logoUrl} alt="ArtisCase" width="140" height="auto" style={logo} />
        <Heading style={h1}>Olá! 👋</Heading>
        <Text style={text}>
          Bem-vindo à{' '}
          <Link href={siteUrl} style={link}>
            <strong>ArtisCase</strong>
          </Link>
          ! Estamos felizes em ter você por aqui.
        </Text>
        <Text style={text}>
          Clique no botão abaixo para confirmar seu email (
          <Link href={`mailto:${recipient}`} style={link}>
            {recipient}
          </Link>
          ) e começar a personalizar sua capinha.
        </Text>
        <Button style={button} href={confirmationUrl}>
          Confirmar Email
        </Button>
        <Text style={footer}>
          Se você não criou uma conta na ArtisCase, pode ignorar este email.
        </Text>
        <Text style={brand}>ArtisCase — Cases personalizadas</Text>
      </Container>
    </Body>
  </Html>
)

export default SignupEmail

const logoUrl = 'https://gfsbsgwxylvhnwbpcodj.supabase.co/storage/v1/object/public/email-assets/logo-artiscase.png'
const main = { backgroundColor: '#ffffff', fontFamily: "'Inter', Arial, sans-serif" }
const container = { padding: '40px 25px', maxWidth: '520px', margin: '0 auto' }
const logo = { margin: '0 auto 32px', display: 'block' as const }
const h1 = { fontSize: '22px', fontWeight: 'bold' as const, color: '#1a1a1a', margin: '0 0 16px' }
const text = { fontSize: '15px', color: '#555555', lineHeight: '1.6', margin: '0 0 20px' }
const link = { color: 'hsl(265, 83%, 57%)', textDecoration: 'underline' }
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
