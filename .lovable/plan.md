

## Meios de Pagamento no Rodapé

Boa ideia — transmite confiança e profissionalismo. Vou adicionar uma faixa entre o grid de 3 colunas e o copyright, com:

- **Badge "Powered by Stripe"** (selo SVG inline com o logo Stripe)
- **Bandeiras de cartão**: Visa, Mastercard, Elo, American Express (ícones SVG inline, compactos)
- **Texto**: "Pagamento 100% seguro" com ícone de cadeado
- **Pix logo** (SVG) — já que é Brasil e Stripe suporta Pix

### Layout

```text
─────────────────────────────────────────
  🔒 Pagamento 100% seguro
  [Visa] [Mastercard] [Elo] [Amex] [Pix]
  ───── Powered by Stripe ─────
─────────────────────────────────────────
  © 2026 ArtisCase...        Feito com ❤️
```

Centralizado, tons `muted-foreground`, ícones em ~28px de altura, espaçamento sutil.

### Implementação

1. Criar `src/components/PaymentBadges.tsx` — componente com todos os SVGs inline (Stripe, Visa, MC, Elo, Amex, Pix) e o texto de segurança
2. Importar no footer de `Landing.tsx`, posicionando entre o `<Separator>` e o bloco de copyright

Nenhuma dependência nova necessária — tudo SVG inline.

