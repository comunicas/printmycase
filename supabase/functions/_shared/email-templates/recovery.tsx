/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'
import { Link, Text } from 'npm:@react-email/components@0.0.22'
import { AuthCtaButton, AuthEmailShell, link, paragraph } from './layout.tsx'

interface RecoveryEmailProps {
  siteName: string
  confirmationUrl: string
}

export const RecoveryEmail = ({ siteName, confirmationUrl }: RecoveryEmailProps) => (
  <AuthEmailShell
    preview={`Redefina sua senha na ${siteName}`}
    title="Redefinir senha"
    footer="Se você não pediu a redefinição, pode ignorar esta mensagem. Sua senha atual continuará válida."
  >
    <Text style={paragraph}>
      Recebemos uma solicitação para trocar a senha da sua conta PrintMyCase.
    </Text>
    <Text style={paragraph}>
      Para continuar com segurança, clique no botão abaixo e escolha uma nova senha.
    </Text>
    <AuthCtaButton href={confirmationUrl}>Criar nova senha</AuthCtaButton>
    <Text style={paragraph}>
      Se preferir, abra este link diretamente no navegador:<br />
      <Link href={confirmationUrl} style={link}>
        {confirmationUrl}
      </Link>
    </Text>
  </AuthEmailShell>
)

export default RecoveryEmail
