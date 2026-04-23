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

export const LOGO_URL = 'https://iqnqpwnbdqzvqssxcxgb.supabase.co/storage/v1/object/public/email-assets/logo-printmycase.png'
export const BRAND_COLOR = 'hsl(265, 83%, 57%)'
export const SITE_SUPPORT_EMAIL = 'sac@printmycase.com.br'

interface AuthEmailShellProps {
  preview: string
  title: string
  children: React.ReactNode
  footer?: React.ReactNode
}

export const AuthEmailShell = ({ preview, title, children, footer }: AuthEmailShellProps) => (
  <Html lang="pt-BR" dir="ltr">
    <Head />
    <Preview>{preview}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={card}>
          <Img src={LOGO_URL} alt="PrintMyCase" height="40" style={logo} />
          <Heading style={h1}>{title}</Heading>
          {children}
          <Text style={footerText}>
            {footer ?? 'Se precisar de ajuda, fale com nosso time em sac@printmycase.com.br.'}
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

interface AuthCtaButtonProps {
  href: string
  children: React.ReactNode
}

export const AuthCtaButton = ({ href, children }: AuthCtaButtonProps) => (
  <Button style={button} href={href}>
    {children}
  </Button>
)

export const paragraph = {
  fontSize: '14px',
  color: '#555555',
  lineHeight: '1.65',
  margin: '0 0 16px',
}

export const muted = {
  fontSize: '13px',
  color: '#6b7280',
  lineHeight: '1.6',
  margin: '0 0 12px',
}

export const link = {
  color: BRAND_COLOR,
  textDecoration: 'underline',
}

export const codeBlock = {
  backgroundColor: '#f5f3ff',
  border: '1px solid #ddd6fe',
  borderRadius: '16px',
  color: '#19191d',
  fontFamily: "'SFMono-Regular', Consolas, 'Liberation Mono', monospace",
  fontSize: '28px',
  fontWeight: '700' as const,
  letterSpacing: '0.24em',
  margin: '0 0 20px',
  padding: '18px 20px',
  textAlign: 'center' as const,
}

const main = {
  backgroundColor: '#ffffff',
  fontFamily: "'Inter', Arial, sans-serif",
  margin: '0',
  padding: '32px 0',
}

const container = {
  margin: '0 auto',
  maxWidth: '560px',
  padding: '0 16px',
}

const card = {
  backgroundColor: '#ffffff',
  border: '1px solid #ede9fe',
  borderRadius: '24px',
  padding: '32px 28px',
}

const logo = {
  height: '40px',
  marginBottom: '24px',
  width: 'auto',
}

const h1 = {
  color: '#19191d',
  fontSize: '24px',
  fontWeight: '700' as const,
  lineHeight: '1.2',
  margin: '0 0 18px',
}

const button = {
  backgroundColor: BRAND_COLOR,
  borderRadius: '24px',
  color: '#ffffff',
  display: 'inline-block' as const,
  fontSize: '14px',
  fontWeight: '600' as const,
  margin: '10px 0 22px',
  padding: '14px 28px',
  textDecoration: 'none',
}

const footerText = {
  borderTop: '1px solid #ede9fe',
  color: '#999999',
  fontSize: '12px',
  lineHeight: '1.6',
  margin: '28px 0 0',
  paddingTop: '20px',
}
