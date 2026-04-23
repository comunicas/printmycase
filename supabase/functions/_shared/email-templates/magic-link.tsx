/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'
import { Link, Text } from 'npm:@react-email/components@0.0.22'
import { AuthCtaButton, AuthEmailShell, link, paragraph } from './layout.tsx'

interface MagicLinkEmailProps {
  siteName: string
  confirmationUrl: string
}

export const MagicLinkEmail = ({ siteName, confirmationUrl }: MagicLinkEmailProps) => (
  <AuthEmailShell
    preview={`Seu link de acesso para ${siteName}`}
    title="Entrar na sua conta"
    footer="Se você não solicitou este acesso, ignore esta mensagem. O link expira em pouco tempo."
  >
    <Text style={paragraph}>
      Use o botão abaixo para entrar na sua conta {siteName} sem precisar digitar a senha.
    </Text>
    <AuthCtaButton href={confirmationUrl}>Acessar minha conta</AuthCtaButton>
    <Text style={paragraph}>
      Se o botão não funcionar, abra este link no navegador:<br />
      <Link href={confirmationUrl} style={link}>
        {confirmationUrl}
      </Link>
    </Text>
  </AuthEmailShell>
)

export default MagicLinkEmail
