/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'
import { Link, Text } from 'npm:@react-email/components@0.0.22'
import { AuthCtaButton, AuthEmailShell, link, paragraph } from './layout.tsx'

interface EmailChangeEmailProps {
  siteName: string
  email: string
  newEmail: string
  confirmationUrl: string
}

export const EmailChangeEmail = ({ siteName, email, newEmail, confirmationUrl }: EmailChangeEmailProps) => (
  <AuthEmailShell
    preview={`Confirme a troca de email em ${siteName}`}
    title="Confirmar troca de email"
    footer="Se você não pediu essa alteração, recomendamos redefinir sua senha imediatamente."
  >
    <Text style={paragraph}>
      Recebemos um pedido para trocar o email da sua conta de{' '}
      <Link href={`mailto:${email}`} style={link}>
        {email}
      </Link>{' '}
      para{' '}
      <Link href={`mailto:${newEmail}`} style={link}>
        {newEmail}
      </Link>
      .
    </Text>
    <Text style={paragraph}>
      Para confirmar a alteração e manter sua conta segura, use o botão abaixo.
    </Text>
    <AuthCtaButton href={confirmationUrl}>Confirmar novo email</AuthCtaButton>
  </AuthEmailShell>
)

export default EmailChangeEmail
