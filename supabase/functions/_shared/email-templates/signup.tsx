/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'
import { Link, Text } from 'npm:@react-email/components@0.0.22'
import { AuthCtaButton, AuthEmailShell, link, paragraph } from './layout.tsx'

interface SignupEmailProps {
  siteName: string
  siteUrl: string
  recipient: string
  confirmationUrl: string
}

export const SignupEmail = ({ siteName, siteUrl, recipient, confirmationUrl }: SignupEmailProps) => (
  <AuthEmailShell
    preview={`Confirme sua conta ${siteName}`}
    title="Confirme seu cadastro"
    footer="Se você não criou uma conta na PrintMyCase, pode ignorar esta mensagem com segurança."
  >
    <Text style={paragraph}>
      Que bom ter você por aqui. Falta só confirmar o email para liberar sua conta e começar a criar sua capinha com mais segurança.
    </Text>
    <Text style={paragraph}>
      Estamos validando o endereço{' '}
      <Link href={`mailto:${recipient}`} style={link}>
        {recipient}
      </Link>{' '}
      para a sua conta em{' '}
      <Link href={siteUrl} style={link}>
        {siteName}
      </Link>
      .
    </Text>
    <AuthCtaButton href={confirmationUrl}>Confirmar email</AuthCtaButton>
    <Text style={paragraph}>
      Se o botão não abrir, copie e cole este link no navegador:<br />
      <Link href={confirmationUrl} style={link}>
        {confirmationUrl}
      </Link>
    </Text>
  </AuthEmailShell>
)

export default SignupEmail
