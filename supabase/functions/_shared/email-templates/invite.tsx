/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'
import { Link, Text } from 'npm:@react-email/components@0.0.22'
import { AuthCtaButton, AuthEmailShell, link, paragraph } from './layout.tsx'

interface InviteEmailProps {
  siteName: string
  siteUrl: string
  confirmationUrl: string
}

export const InviteEmail = ({ siteName, siteUrl, confirmationUrl }: InviteEmailProps) => (
  <AuthEmailShell
    preview={`Você recebeu um convite para ${siteName}`}
    title="Seu convite está pronto"
    footer="Se você não esperava este convite, pode ignorar esta mensagem sem qualquer ação adicional."
  >
    <Text style={paragraph}>
      Você recebeu um convite para acessar a plataforma{' '}
      <Link href={siteUrl} style={link}>
        {siteName}
      </Link>
      .
    </Text>
    <Text style={paragraph}>
      Clique abaixo para aceitar o convite, concluir o acesso e continuar sua experiência na PrintMyCase.
    </Text>
    <AuthCtaButton href={confirmationUrl}>Aceitar convite</AuthCtaButton>
  </AuthEmailShell>
)

export default InviteEmail
