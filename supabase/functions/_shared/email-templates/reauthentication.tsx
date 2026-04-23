/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'
import { Text } from 'npm:@react-email/components@0.0.22'
import { AuthEmailShell, codeBlock, paragraph } from './layout.tsx'

interface ReauthenticationEmailProps {
  token: string
}

export const ReauthenticationEmail = ({ token }: ReauthenticationEmailProps) => (
  <AuthEmailShell
    preview="Seu código de verificação PrintMyCase"
    title="Confirmar sua identidade"
    footer="Este código expira em poucos minutos. Se você não pediu essa verificação, ignore este email."
  >
    <Text style={paragraph}>
      Use o código abaixo para concluir a verificação e continuar com segurança na sua conta.
    </Text>
    <Text style={codeBlock}>{token}</Text>
  </AuthEmailShell>
)

export default ReauthenticationEmail
