/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import { Body, Button, Container, Head, Heading, Html, Img, Preview, Section, Text } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const LOGO_URL = 'https://iqnqpwnbdqzvqssxcxgb.supabase.co/storage/v1/object/public/email-assets/logo-printmycase.png'
const BRAND_COLOR = 'hsl(265, 83%, 57%)'

interface AbandonedCartProps {
  userName?: string
  productName?: string
  productImageUrl?: string
  resumeUrl?: string
  step?: 1 | 2 | 3
}

const STEP_COPY: Record<number, { heading: string; lead: string; cta: string }> = {
  1: {
    heading: 'Você esqueceu sua arte 🎨',
    lead: 'Sua customização ficou salva e está pronta para você terminar — leva só alguns cliques.',
    cta: 'Continuar customização',
  },
  2: {
    heading: 'Sua capa ainda está te esperando',
    lead: 'Salvamos seu rascunho para você não precisar começar do zero. Volte e finalize quando quiser.',
    cta: 'Retomar de onde parei',
  },
  3: {
    heading: 'Última chance: sua capa está pronta',
    lead: 'Antes que seu rascunho expire, finalize sua capa personalizada e receba em casa em poucos dias.',
    cta: 'Finalizar meu pedido',
  },
}

const AbandonedCartEmail = ({
  userName = 'Cliente',
  productName = 'sua capa personalizada',
  productImageUrl,
  resumeUrl = 'https://printmycase.com.br',
  step = 1,
}: AbandonedCartProps) => {
  const copy = STEP_COPY[step] ?? STEP_COPY[1]
  return (
    <Html lang="pt-BR" dir="ltr">
      <Head />
      <Preview>{copy.lead}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Img src={LOGO_URL} alt="PrintMyCase" height="40" style={logo} />
          <Heading style={h1}>{copy.heading}</Heading>
          <Text style={text}>Oi {userName}, você começou a personalizar <strong>{productName}</strong> aqui na PrintMyCase mas não finalizou o pedido.</Text>
          <Text style={text}>{copy.lead}</Text>

          {productImageUrl ? (
            <Section style={imageSection}>
              <Img src={productImageUrl} alt={productName} width="220" style={productImage} />
            </Section>
          ) : null}

          <Section style={{ textAlign: 'center' as const, margin: '24px 0' }}>
            <Button style={button} href={resumeUrl}>{copy.cta}</Button>
          </Section>

          <Text style={muted}>Se você já concluiu sua compra, pode ignorar este email. 💜</Text>
          <Text style={footer}>PrintMyCase — Capas personalizadas com IA</Text>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: AbandonedCartEmail,
  subject: (data: Record<string, any>) => {
    const step = (data?.step ?? 1) as number
    if (step === 3) return 'Última chance: finalize sua capa personalizada'
    if (step === 2) return 'Sua capa personalizada ainda está aqui'
    return 'Você esqueceu sua arte 🎨'
  },
  displayName: 'Lembrete de carrinho abandonado',
  previewData: {
    userName: 'Maria',
    productName: 'Capa iPhone 15 Pro',
    productImageUrl: 'https://iqnqpwnbdqzvqssxcxgb.supabase.co/storage/v1/object/public/email-assets/logo-printmycase.png',
    resumeUrl: 'https://printmycase.com.br/customize/iphone-15-pro',
    step: 1,
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Inter', Arial, sans-serif" }
const container = { padding: '32px 25px', maxWidth: '560px' }
const logo = { height: '40px', width: 'auto', marginBottom: '24px' }
const h1 = { fontSize: '24px', fontWeight: '700' as const, color: '#19191d', margin: '0 0 16px' }
const text = { fontSize: '14px', color: '#555555', lineHeight: '1.6', margin: '0 0 16px' }
const imageSection = { textAlign: 'center' as const, margin: '20px 0', padding: '16px', backgroundColor: '#f5f3ff', borderRadius: '16px' }
const productImage = { borderRadius: '12px', maxWidth: '100%', height: 'auto' }
const button = { backgroundColor: BRAND_COLOR, borderRadius: '24px', color: '#ffffff', display: 'inline-block' as const, fontSize: '14px', fontWeight: '600' as const, padding: '14px 28px', textDecoration: 'none' }
const muted = { fontSize: '13px', color: '#6b7280', lineHeight: '1.6', margin: '20px 0 0' }
const footer = { fontSize: '12px', color: '#999999', margin: '24px 0 0', borderTop: '1px solid #ede9fe', paddingTop: '16px' }
